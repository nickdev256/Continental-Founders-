import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  AlertCircle,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  Eye,
  FileImage,
  Filter,
  Image as ImageIcon,
  Images,
  LoaderCircle,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import "./AdminGallery.css";


// ============================================================
// API
// ============================================================

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");


// ============================================================
// CONFIGURATION
// ============================================================

const MAX_FILE_SIZE =
  10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const PAGE_SIZE_OPTIONS = [
  12,
  24,
  48,
];

const ALL_CATEGORIES =
  "all";

const ALL_STATUSES =
  "all";


// ============================================================
// INITIAL FORM
// ============================================================

const EMPTY_FORM = {
  title: "",
  caption: "",
  category: "",
  eventDate: "",
  status: "published",
  altText: "",
};


// ============================================================
// HELPERS
// ============================================================

function cleanString(value) {
  return typeof value === "string"
    ? value.trim()
    : "";
}


function normalizeStatus(value) {
  const status =
    cleanString(value)
      .toLowerCase();

  return status === "published"
    ? "published"
    : "draft";
}


function normalizeGalleryItem(
  item
) {
  if (
    !item ||
    typeof item !== "object"
  ) {
    return null;
  }

  return {
    id:
      item.id,

    title:
      cleanString(
        item.title
      ),

    caption:
      cleanString(
        item.caption ||
        item.description
      ),

    category:
      cleanString(
        item.category
      ) ||
      "General",

    imageUrl:
      cleanString(
        item.imageUrl ||
        item.image_url ||
        item.publicUrl ||
        item.public_url
      ),

    imagePath:
      cleanString(
        item.imagePath ||
        item.image_path
      ),

    altText:
      cleanString(
        item.altText ||
        item.alt_text
      ),

    eventDate:
      item.eventDate ||
      item.event_date ||
      null,

    status:
      normalizeStatus(
        item.status
      ),

    sortOrder:
      Number(
        item.sortOrder ??
        item.sort_order ??
        0
      ) || 0,

    downloadCount:
      Number(
        item.downloadCount ??
        item.download_count ??
        0
      ) || 0,

    viewCount:
      Number(
        item.viewCount ??
        item.view_count ??
        0
      ) || 0,

    createdAt:
      item.createdAt ||
      item.created_at ||
      null,

    updatedAt:
      item.updatedAt ||
      item.updated_at ||
      null,
  };
}


function normalizeGalleryResponse(
  payload
) {
  let records = [];

  if (Array.isArray(payload)) {
    records = payload;
  } else if (
    Array.isArray(
      payload?.items
    )
  ) {
    records =
      payload.items;
  } else if (
    Array.isArray(
      payload?.gallery
    )
  ) {
    records =
      payload.gallery;
  } else if (
    Array.isArray(
      payload?.data
    )
  ) {
    records =
      payload.data;
  } else if (
    Array.isArray(
      payload?.data?.items
    )
  ) {
    records =
      payload.data.items;
  } else if (
    Array.isArray(
      payload?.data?.gallery
    )
  ) {
    records =
      payload.data.gallery;
  }

  return records
    .map(
      normalizeGalleryItem
    )
    .filter(
      (item) =>
        item &&
        item.id
    );
}


function formatDate(value) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  ).format(date);
}


function dateInputValue(value) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}


function validateFile(file) {
  if (!file) {
    return {
      valid: false,
      message:
        "Please select an image.",
    };
  }

  if (
    !ALLOWED_TYPES.includes(
      file.type
    )
  ) {
    return {
      valid: false,
      message:
        "Only JPG, PNG and WebP images are supported.",
    };
  }

  if (
    file.size >
    MAX_FILE_SIZE
  ) {
    return {
      valid: false,
      message:
        "Each image must be 10MB or smaller.",
    };
  }

  return {
    valid: true,
    message: "",
  };
}


function createLocalFile(
  file
) {
  return {
    id:
      `${file.name}-${file.size}-${file.lastModified}`,

    file,

    preview:
      URL.createObjectURL(
        file
      ),
  };
}


// ============================================================
// REQUEST HELPER
// ============================================================

async function request(
  endpoint,
  options = {}
) {
  const response =
    await fetch(
      `${API_URL}${endpoint}`,
      {
        credentials:
          "include",

        ...options,

        headers: {
          Accept:
            "application/json",

          ...options.headers,
        },
      }
    );

  let payload = {};

  try {
    payload =
      await response.json();
  } catch {
    payload = {};
  }

  if (!response.ok) {
    throw new Error(
      payload?.message ||
      payload?.error ||
      "Something went wrong."
    );
  }

  return payload;
}


// ============================================================
// COMPONENT
// ============================================================

export default function AdminGallery() {

  // ==========================================================
  // DATA
  // ==========================================================

  const [
    gallery,
    setGallery,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");


  // ==========================================================
  // FILTERS
  // ==========================================================

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState(
    ALL_CATEGORIES
  );

  const [
    statusFilter,
    setStatusFilter,
  ] = useState(
    ALL_STATUSES
  );

  const [
    sortBy,
    setSortBy,
  ] = useState(
    "newest"
  );


  // ==========================================================
  // PAGINATION
  // ==========================================================

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    pageSize,
    setPageSize,
  ] = useState(12);


  // ==========================================================
  // SELECTION
  // ==========================================================

  const [
    selectedIds,
    setSelectedIds,
  ] = useState(
    new Set()
  );


  // ==========================================================
  // MODALS
  // ==========================================================

  const [
    uploadOpen,
    setUploadOpen,
  ] = useState(false);

  const [
    editItem,
    setEditItem,
  ] = useState(null);

  const [
    deleteItem,
    setDeleteItem,
  ] = useState(null);


  // ==========================================================
  // FORM
  // ==========================================================

  const [
    form,
    setForm,
  ] = useState(
    EMPTY_FORM
  );

  const [
    files,
    setFiles,
  ] = useState([]);

  const [
    uploadProgress,
    setUploadProgress,
  ] = useState({
    total: 0,
    completed: 0,
    successful: 0,
    failed: 0,
    currentName: "",
  });

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    actionId,
    setActionId,
  ] = useState(null);

  const [
    bulkLoading,
    setBulkLoading,
  ] = useState(false);

  const fileInputRef =
    useRef(null);


  // ==========================================================
  // CLEAR MESSAGES
  // ==========================================================

  useEffect(() => {
    if (!success) {
      return undefined;
    }

    const timeout =
      window.setTimeout(
        () => {
          setSuccess("");
        },
        3500
      );

    return () =>
      window.clearTimeout(
        timeout
      );
  }, [success]);


  // ==========================================================
  // LOAD GALLERY
  // ==========================================================

  const loadGallery =
    useCallback(
      async () => {
        setLoading(true);
        setError("");

        try {
          const payload =
            await request(
              "/api/gallery/admin"
            );

          setGallery(
            normalizeGalleryResponse(
              payload
            )
          );

          setSelectedIds(
            new Set()
          );
        } catch (
          requestError
        ) {
          console.error(
            "Admin gallery error:",
            requestError
          );

          setGallery([]);

          setError(
            requestError?.message ||
            "Unable to load gallery."
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );


  useEffect(() => {
    loadGallery();
  }, [loadGallery]);


  // ==========================================================
  // PREVIEW CLEANUP
  // Object URLs are revoked when a file is removed or the modal closes.
  // ==========================================================

  // ==========================================================
  // CATEGORIES
  // ==========================================================

  const categories =
    useMemo(() => {
      const values =
        new Set();

      gallery.forEach(
        (item) => {
          if (
            item.category
          ) {
            values.add(
              item.category
            );
          }
        }
      );

      return Array.from(
        values
      ).sort(
        (a, b) =>
          a.localeCompare(b)
      );
    }, [gallery]);


  // ==========================================================
  // STATISTICS
  // ==========================================================

  const stats =
    useMemo(() => {
      const published =
        gallery.filter(
          (item) =>
            item.status ===
            "published"
        ).length;

      const drafts =
        gallery.length -
        published;

      const totalDownloads =
        gallery.reduce(
          (
            total,
            item
          ) =>
            total +
            item.downloadCount,
          0
        );

      const totalViews =
        gallery.reduce(
          (
            total,
            item
          ) =>
            total +
            item.viewCount,
          0
        );

      return {
        total:
          gallery.length,

        published,

        drafts,

        categories:
          categories.length,

        downloads:
          totalDownloads,

        views:
          totalViews,
      };
    }, [
      gallery,
      categories,
    ]);


  // ==========================================================
  // FILTERING
  // ==========================================================

  const filteredGallery =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      let result =
        gallery.filter(
          (item) => {
            const matchesCategory =
              categoryFilter ===
                ALL_CATEGORIES ||
              item.category ===
                categoryFilter;

            const matchesStatus =
              statusFilter ===
                ALL_STATUSES ||
              item.status ===
                statusFilter;

            let matchesSearch =
              true;

            if (query) {
              const searchable =
                [
                  item.title,
                  item.caption,
                  item.category,
                  item.altText,
                ]
                  .filter(Boolean)
                  .join(" ")
                  .toLowerCase();

              matchesSearch =
                searchable.includes(
                  query
                );
            }

            return (
              matchesCategory &&
              matchesStatus &&
              matchesSearch
            );
          }
        );

      result = [
        ...result,
      ];

      result.sort(
        (a, b) => {
          if (
            sortBy ===
            "oldest"
          ) {
            return (
              new Date(
                a.createdAt || 0
              ).getTime() -
              new Date(
                b.createdAt || 0
              ).getTime()
            );
          }

          if (
            sortBy ===
            "title"
          ) {
            return (
              a.title ||
              ""
            ).localeCompare(
              b.title ||
              ""
            );
          }

          if (
            sortBy ===
            "downloads"
          ) {
            return (
              b.downloadCount -
              a.downloadCount
            );
          }

          return (
            new Date(
              b.createdAt || 0
            ).getTime() -
            new Date(
              a.createdAt || 0
            ).getTime()
          );
        }
      );

      return result;
    }, [
      gallery,
      search,
      categoryFilter,
      statusFilter,
      sortBy,
    ]);


  // ==========================================================
  // PAGINATION
  // ==========================================================

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredGallery.length /
        pageSize
      )
    );


  useEffect(() => {
    setPage(1);
  }, [
    search,
    categoryFilter,
    statusFilter,
    sortBy,
    pageSize,
  ]);


  useEffect(() => {
    if (
      page >
      totalPages
    ) {
      setPage(
        totalPages
      );
    }
  }, [
    page,
    totalPages,
  ]);


  const paginatedGallery =
    useMemo(() => {
      const start =
        (page - 1) *
        pageSize;

      return filteredGallery.slice(
        start,
        start + pageSize
      );
    }, [
      filteredGallery,
      page,
      pageSize,
    ]);


  // ==========================================================
  // FILE SELECTION
  // ==========================================================

  const handleFiles =
    (incomingFiles) => {
      const selected = Array.from(incomingFiles || []);

      if (selected.length === 0) {
        return;
      }

      setError("");

      setFiles((current) => {
        const existingIds = new Set(
          current.map((item) => item.id)
        );

        const validFiles = [];
        const errors = [];

        selected.forEach((file) => {
          const result = validateFile(file);
          const fileId = `${file.name}-${file.size}-${file.lastModified}`;

          if (!result.valid) {
            errors.push(`${file.name}: ${result.message}`);
            return;
          }

          if (existingIds.has(fileId)) {
            errors.push(`${file.name}: already selected.`);
            return;
          }

          const localFile = createLocalFile(file);
          existingIds.add(localFile.id);
          validFiles.push(localFile);
        });

        if (errors.length > 0) {
          setError(errors.join(" "));
        }

        return [...current, ...validFiles];
      });
    };


  const handleFileInput =
    (event) => {
      handleFiles(
        event.target.files
      );

      event.target.value =
        "";
    };


  const removeFile =
    (fileId) => {
      setFiles(
        (current) => {
          const found =
            current.find(
              (item) =>
                item.id ===
                fileId
            );

          if (
            found?.preview
          ) {
            URL.revokeObjectURL(
              found.preview
            );
          }

          return current.filter(
            (item) =>
              item.id !==
              fileId
          );
        }
      );
    };


  // ==========================================================
  // DRAG & DROP
  // ==========================================================

  const handleDrop =
    (event) => {
      event.preventDefault();

      handleFiles(
        event.dataTransfer.files
      );
    };


  // ==========================================================
  // FORM CHANGE
  // ==========================================================

  const updateForm =
    (
      field,
      value
    ) => {
      setForm(
        (current) => ({
          ...current,
          [field]:
            value,
        })
      );
    };


  // ==========================================================
  // OPEN UPLOAD
  // ==========================================================

  const openUpload =
    () => {
      setForm(
        EMPTY_FORM
      );

      setFiles([]);

      setUploadProgress({
        total: 0,
        completed: 0,
        successful: 0,
        failed: 0,
        currentName: "",
      });

      setEditItem(null);

      setError("");

      setUploadOpen(true);
    };


  // ==========================================================
  // CLOSE UPLOAD
  // ==========================================================

  const closeUpload =
    () => {
      if (submitting) {
        return;
      }

      files.forEach(
        (item) => {
          if (
            item.preview
          ) {
            URL.revokeObjectURL(
              item.preview
            );
          }
        }
      );

      setFiles([]);
      setForm(
        EMPTY_FORM
      );

      setUploadProgress({
        total: 0,
        completed: 0,
        successful: 0,
        failed: 0,
        currentName: "",
      });

      setUploadOpen(false);
    };


  // ==========================================================
  // CREATE
  // ==========================================================

  const handleCreate =
    async (event) => {
      event.preventDefault();
      setError("");

      if (files.length === 0) {
        setError("Select at least one photo.");
        return;
      }

      if (!cleanString(form.title)) {
        setError("Enter a title.");
        return;
      }

      if (!cleanString(form.category)) {
        setError("Enter a category.");
        return;
      }

      setSubmitting(true);
      setUploadProgress({
        total: files.length,
        completed: 0,
        successful: 0,
        failed: 0,
        currentName: "",
      });

      const failures = [];
      let successful = 0;

      try {
        for (let index = 0; index < files.length; index += 1) {
          const item = files[index];

          setUploadProgress((current) => ({
            ...current,
            currentName: item.file.name,
          }));

          const body = new FormData();
          body.append("image", item.file);
          body.append("title", cleanString(form.title));
          body.append("caption", cleanString(form.caption));
          body.append("category", cleanString(form.category));
          body.append("status", form.status);
          body.append("altText", cleanString(form.altText));

          if (form.eventDate) {
            body.append("eventDate", form.eventDate);
          }

          try {
            await request("/api/gallery/admin", {
              method: "POST",
              body,
            });

            successful += 1;
            setUploadProgress((current) => ({
              ...current,
              completed: current.completed + 1,
              successful: current.successful + 1,
            }));
          } catch (requestError) {
            failures.push({
              name: item.file.name,
              message: requestError?.message || "Upload failed.",
            });

            setUploadProgress((current) => ({
              ...current,
              completed: current.completed + 1,
              failed: current.failed + 1,
            }));
          }
        }

        if (successful > 0) {
          await loadGallery();
        }

        if (failures.length === 0) {
          setSuccess(
            successful === 1
              ? "Photo uploaded successfully."
              : `${successful} photos uploaded successfully.`
          );

          files.forEach((item) => {
            if (item.preview) URL.revokeObjectURL(item.preview);
          });

          setFiles([]);
          setForm(EMPTY_FORM);
          setUploadOpen(false);
        } else {
          setSuccess(
            successful > 0
              ? `${successful} of ${files.length} photos uploaded successfully.`
              : ""
          );

          setError(
            `${failures.length} photo${failures.length === 1 ? "" : "s"} failed: ` +
              failures.map((item) => `${item.name} (${item.message})`).join("; ")
          );

          const failedNames = new Set(failures.map((item) => item.name));
          setFiles((current) => {
            current.forEach((item) => {
              if (!failedNames.has(item.file.name) && item.preview) {
                URL.revokeObjectURL(item.preview);
              }
            });
            return current.filter((item) => failedNames.has(item.file.name));
          });
        }
      } finally {
        setSubmitting(false);
        setUploadProgress((current) => ({
          ...current,
          currentName: "",
        }));
      }
    };


  // ==========================================================
  // OPEN EDIT
  // ==========================================================

  const openEdit =
    (item) => {
      setEditItem(
        item
      );

      setForm({
        title:
          item.title ||
          "",

        caption:
          item.caption ||
          "",

        category:
          item.category ||
          "",

        eventDate:
          dateInputValue(
            item.eventDate
          ),

        status:
          item.status ||
          "draft",

        altText:
          item.altText ||
          "",
      });

      setError("");
    };


  // ==========================================================
  // SAVE EDIT
  // ==========================================================

  const handleEdit =
    async (event) => {
      event.preventDefault();

      if (!editItem) {
        return;
      }

      if (
        !cleanString(
          form.title
        )
      ) {
        setError(
          "Enter a title."
        );

        return;
      }

      if (
        !cleanString(
          form.category
        )
      ) {
        setError(
          "Enter a category."
        );

        return;
      }

      setSubmitting(true);
      setError("");

      try {
        const payload = {
          title:
            cleanString(
              form.title
            ),

          caption:
            cleanString(
              form.caption
            ),

          category:
            cleanString(
              form.category
            ),

          eventDate:
            form.eventDate ||
            null,

          status:
            form.status,

          altText:
            cleanString(
              form.altText
            ),
        };

        await request(
          `/api/gallery/admin/${editItem.id}`,
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                payload
              ),
          }
        );

        setEditItem(null);

        setSuccess(
          "Gallery photo updated."
        );

        await loadGallery();
      } catch (
        requestError
      ) {
        setError(
          requestError?.message ||
          "Unable to update photo."
        );
      } finally {
        setSubmitting(false);
      }
    };


  // ==========================================================
  // STATUS
  // ==========================================================

  const changeStatus =
    async (
      item,
      status
    ) => {
      setActionId(
        item.id
      );

      setError("");

      try {
        await request(
          `/api/gallery/admin/${item.id}/status`,
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                status,
              }),
          }
        );

        setGallery(
          (current) =>
            current.map(
              (record) =>
                record.id ===
                item.id
                  ? {
                      ...record,
                      status,
                    }
                  : record
            )
        );

        setSuccess(
          status ===
          "published"
            ? "Photo published."
            : "Photo unpublished."
        );
      } catch (
        requestError
      ) {
        setError(
          requestError?.message ||
          "Unable to change status."
        );
      } finally {
        setActionId(
          null
        );
      }
    };


  // ==========================================================
  // DELETE
  // ==========================================================

  const handleDelete =
    async () => {
      if (!deleteItem) {
        return;
      }

      setActionId(
        deleteItem.id
      );

      setError("");

      try {
        await request(
          `/api/gallery/admin/${deleteItem.id}`,
          {
            method:
              "DELETE",
          }
        );

        setGallery(
          (current) =>
            current.filter(
              (item) =>
                item.id !==
                deleteItem.id
            )
        );

        setSelectedIds(
          (current) => {
            const next =
              new Set(
                current
              );

            next.delete(
              deleteItem.id
            );

            return next;
          }
        );

        setDeleteItem(null);

        setSuccess(
          "Photo deleted."
        );
      } catch (
        requestError
      ) {
        setError(
          requestError?.message ||
          "Unable to delete photo."
        );
      } finally {
        setActionId(
          null
        );
      }
    };


  // ==========================================================
  // SELECTION
  // ==========================================================

  const toggleSelection =
    (id) => {
      setSelectedIds(
        (current) => {
          const next =
            new Set(
              current
            );

          if (
            next.has(id)
          ) {
            next.delete(id);
          } else {
            next.add(id);
          }

          return next;
        }
      );
    };


  const allVisibleSelected =
    paginatedGallery.length >
      0 &&
    paginatedGallery.every(
      (item) =>
        selectedIds.has(
          item.id
        )
    );


  const toggleVisible =
    () => {
      setSelectedIds(
        (current) => {
          const next =
            new Set(
              current
            );

          if (
            allVisibleSelected
          ) {
            paginatedGallery.forEach(
              (item) =>
                next.delete(
                  item.id
                )
            );
          } else {
            paginatedGallery.forEach(
              (item) =>
                next.add(
                  item.id
                )
            );
          }

          return next;
        }
      );
    };


  // ==========================================================
  // BULK STATUS
  // ==========================================================

  const bulkStatus =
    async (status) => {
      const ids =
        Array.from(
          selectedIds
        );

      if (
        ids.length ===
        0
      ) {
        return;
      }

      setBulkLoading(true);
      setError("");

      try {
        await Promise.all(
          ids.map(
            (id) =>
              request(
                `/api/gallery/admin/${id}/status`,
                {
                  method:
                    "PATCH",

                  headers: {
                    "Content-Type":
                      "application/json",
                  },

                  body:
                    JSON.stringify({
                      status,
                    }),
                }
              )
          )
        );

        setGallery(
          (current) =>
            current.map(
              (item) =>
                selectedIds.has(
                  item.id
                )
                  ? {
                      ...item,
                      status,
                    }
                  : item
            )
        );

        setSelectedIds(
          new Set()
        );

        setSuccess(
          status ===
          "published"
            ? "Selected photos published."
            : "Selected photos unpublished."
        );
      } catch (
        requestError
      ) {
        setError(
          requestError?.message ||
          "Bulk update failed."
        );
      } finally {
        setBulkLoading(false);
      }
    };


  // ==========================================================
  // BULK DELETE
  // ==========================================================

  const bulkDelete =
    async () => {
      const ids =
        Array.from(
          selectedIds
        );

      if (
        ids.length ===
        0
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          `Delete ${ids.length} selected photo${ids.length === 1 ? "" : "s"}? This cannot be undone.`
        );

      if (!confirmed) {
        return;
      }

      setBulkLoading(true);
      setError("");

      try {
        await Promise.all(
          ids.map(
            (id) =>
              request(
                `/api/gallery/admin/${id}`,
                {
                  method:
                    "DELETE",
                }
              )
          )
        );

        setGallery(
          (current) =>
            current.filter(
              (item) =>
                !selectedIds.has(
                  item.id
                )
            )
        );

        setSelectedIds(
          new Set()
        );

        setSuccess(
          "Selected photos deleted."
        );
      } catch (
        requestError
      ) {
        setError(
          requestError?.message ||
          "Unable to delete selected photos."
        );
      } finally {
        setBulkLoading(false);
      }
    };


  // ==========================================================
  // PAGINATION NUMBERS
  // ==========================================================

  const pageNumbers =
    useMemo(() => {
      const pages = [];

      const start =
        Math.max(
          1,
          page - 2
        );

      const end =
        Math.min(
          totalPages,
          start + 4
        );

      for (
        let current =
          Math.max(
            1,
            end - 4
          );
        current <= end;
        current += 1
      ) {
        pages.push(
          current
        );
      }

      return pages;
    }, [
      page,
      totalPages,
    ]);


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="admin-gallery">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <header className="admin-gallery__header">

        <div>
          <p className="admin-gallery__eyebrow">
            Content Management
          </p>

          <h1>
            Gallery Management
          </h1>

          <p className="admin-gallery__subtitle">
            Upload, organize and publish
            photos displayed in the
            Continental Founders gallery.
          </p>
        </div>


        <button
          type="button"
          className="admin-gallery__add-button"
          onClick={
            openUpload
          }
        >
          <Plus
            size={19}
          />

          Add Photos
        </button>

      </header>


      {/* =====================================================
          ALERTS
      ====================================================== */}

      {error && (
        <div className="admin-gallery__alert admin-gallery__alert--error">

          <AlertCircle
            size={19}
          />

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            aria-label="Dismiss error"
          >
            <X
              size={17}
            />
          </button>

        </div>
      )}


      {success && (
        <div className="admin-gallery__alert admin-gallery__alert--success">

          <CheckCircle2
            size={19}
          />

          <span>
            {success}
          </span>

          <button
            type="button"
            onClick={() =>
              setSuccess("")
            }
            aria-label="Dismiss message"
          >
            <X
              size={17}
            />
          </button>

        </div>
      )}


      {/* =====================================================
          STATISTICS
      ====================================================== */}

      <section className="admin-gallery__stats">

        <div className="admin-gallery__stat">
          <span className="admin-gallery__stat-icon">
            <Images
              size={23}
            />
          </span>

          <div>
            <strong>
              {stats.total}
            </strong>

            <span>
              Total Photos
            </span>
          </div>
        </div>


        <div className="admin-gallery__stat">
          <span className="admin-gallery__stat-icon">
            <CheckCircle2
              size={23}
            />
          </span>

          <div>
            <strong>
              {stats.published}
            </strong>

            <span>
              Published
            </span>
          </div>
        </div>


        <div className="admin-gallery__stat">
          <span className="admin-gallery__stat-icon">
            <Edit3
              size={22}
            />
          </span>

          <div>
            <strong>
              {stats.drafts}
            </strong>

            <span>
              Drafts
            </span>
          </div>
        </div>


        <div className="admin-gallery__stat">
          <span className="admin-gallery__stat-icon">
            <Filter
              size={22}
            />
          </span>

          <div>
            <strong>
              {stats.categories}
            </strong>

            <span>
              Categories
            </span>
          </div>
        </div>


        <div className="admin-gallery__stat">
          <span className="admin-gallery__stat-icon">
            <Download
              size={22}
            />
          </span>

          <div>
            <strong>
              {
                stats.downloads
                  .toLocaleString()
              }
            </strong>

            <span>
              Downloads
            </span>
          </div>
        </div>


        <div className="admin-gallery__stat">
          <span className="admin-gallery__stat-icon">
            <Eye
              size={22}
            />
          </span>

          <div>
            <strong>
              {
                stats.views
                  .toLocaleString()
              }
            </strong>

            <span>
              Views
            </span>
          </div>
        </div>

      </section>


      {/* =====================================================
          FILTER BAR
      ====================================================== */}

      <section className="admin-gallery__toolbar">

        <div className="admin-gallery__search">

          <Search
            size={18}
          />

          <input
            type="search"
            value={
              search
            }
            onChange={(
              event
            ) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search photos, titles or captions..."
          />

          {search && (
            <button
              type="button"
              onClick={() =>
                setSearch("")
              }
            >
              <X
                size={15}
              />
            </button>
          )}

        </div>


        <select
          value={
            categoryFilter
          }
          onChange={(
            event
          ) =>
            setCategoryFilter(
              event.target.value
            )
          }
        >
          <option value="all">
            All Categories
          </option>

          {categories.map(
            (category) => (
              <option
                key={
                  category
                }
                value={
                  category
                }
              >
                {category}
              </option>
            )
          )}
        </select>


        <select
          value={
            statusFilter
          }
          onChange={(
            event
          ) =>
            setStatusFilter(
              event.target.value
            )
          }
        >
          <option value="all">
            All Statuses
          </option>

          <option value="published">
            Published
          </option>

          <option value="draft">
            Draft
          </option>
        </select>


        <select
          value={
            sortBy
          }
          onChange={(
            event
          ) =>
            setSortBy(
              event.target.value
            )
          }
        >
          <option value="newest">
            Newest First
          </option>

          <option value="oldest">
            Oldest First
          </option>

          <option value="title">
            Title A-Z
          </option>

          <option value="downloads">
            Most Downloaded
          </option>
        </select>


        <button
          type="button"
          className="admin-gallery__refresh"
          onClick={
            loadGallery
          }
          disabled={
            loading
          }
          title="Refresh gallery"
        >
          <RefreshCw
            size={18}
            className={
              loading
                ? "is-spinning"
                : ""
            }
          />
        </button>

      </section>


      {/* =====================================================
          LOADING
      ====================================================== */}

      {loading && (
        <section className="admin-gallery__state">

          <LoaderCircle
            className="is-spinning"
            size={34}
          />

          <h2>
            Loading gallery
          </h2>

          <p>
            Retrieving gallery
            content from the server.
          </p>

        </section>
      )}


      {/* =====================================================
          EMPTY
      ====================================================== */}

      {!loading &&
        filteredGallery.length ===
          0 && (
          <section className="admin-gallery__state">

            <FileImage
              size={42}
            />

            <h2>
              {gallery.length ===
              0
                ? "Your gallery is empty"
                : "No matching photos"}
            </h2>

            <p>
              {gallery.length ===
              0
                ? "Upload your first gallery photo to get started."
                : "Try changing your search or filters."}
            </p>

            {gallery.length ===
              0 && (
              <button
                type="button"
                className="admin-gallery__add-button"
                onClick={
                  openUpload
                }
              >
                <Plus
                  size={18}
                />

                Add Photos
              </button>
            )}

          </section>
        )}


      {/* =====================================================
          GRID
      ====================================================== */}

      {!loading &&
        paginatedGallery.length >
          0 && (
          <section className="admin-gallery__grid">

            {paginatedGallery.map(
              (item) => (
                <article
                  key={
                    item.id
                  }
                  className={
                    selectedIds.has(
                      item.id
                    )
                      ? "admin-gallery-card is-selected"
                      : "admin-gallery-card"
                  }
                >

                  <div className="admin-gallery-card__media">

                    {item.imageUrl ? (
                      <img
                        src={
                          item.imageUrl
                        }
                        alt={
                          item.altText ||
                          item.title ||
                          "Gallery"
                        }
                        loading="lazy"
                      />
                    ) : (
                      <div className="admin-gallery-card__missing">
                        <ImageIcon
                          size={30}
                        />
                      </div>
                    )}


                    <label className="admin-gallery-card__check">
                      <input
                        type="checkbox"
                        checked={
                          selectedIds.has(
                            item.id
                          )
                        }
                        onChange={() =>
                          toggleSelection(
                            item.id
                          )
                        }
                      />

                      <span>
                        <Check
                          size={14}
                        />
                      </span>
                    </label>


                    <span
                      className={
                        item.status ===
                        "published"
                          ? "admin-gallery-card__status is-published"
                          : "admin-gallery-card__status is-draft"
                      }
                    >
                      {item.status ===
                      "published"
                        ? "Published"
                        : "Draft"}
                    </span>

                  </div>


                  <div className="admin-gallery-card__content">

                    <h3>
                      {item.title ||
                        "Untitled Photo"}
                    </h3>


                    <span className="admin-gallery-card__category">
                      {item.category}
                    </span>


                    {item.eventDate && (
                      <p className="admin-gallery-card__date">
                        <CalendarDays
                          size={14}
                        />

                        {formatDate(
                          item.eventDate
                        )}
                      </p>
                    )}


                    {item.caption && (
                      <p className="admin-gallery-card__caption">
                        {item.caption}
                      </p>
                    )}


                    <div className="admin-gallery-card__metrics">

                      <span>
                        <Download
                          size={14}
                        />

                        {
                          item.downloadCount
                            .toLocaleString()
                        }
                      </span>

                      <span>
                        <Eye
                          size={14}
                        />

                        {
                          item.viewCount
                            .toLocaleString()
                        }
                      </span>

                    </div>


                    <div className="admin-gallery-card__actions">

                      <button
                        type="button"
                        onClick={() =>
                          openEdit(
                            item
                          )
                        }
                        title="Edit"
                      >
                        <Edit3
                          size={16}
                        />
                      </button>


                      <button
                        type="button"
                        disabled={
                          actionId ===
                          item.id
                        }
                        onClick={() =>
                          changeStatus(
                            item,
                            item.status ===
                              "published"
                              ? "draft"
                              : "published"
                          )
                        }
                        title={
                          item.status ===
                          "published"
                            ? "Unpublish"
                            : "Publish"
                        }
                      >
                        {actionId ===
                        item.id ? (
                          <LoaderCircle
                            className="is-spinning"
                            size={16}
                          />
                        ) : item.status ===
                          "published" ? (
                          <X
                            size={16}
                          />
                        ) : (
                          <Check
                            size={16}
                          />
                        )}
                      </button>


                      <button
                        type="button"
                        className="is-danger"
                        onClick={() =>
                          setDeleteItem(
                            item
                          )
                        }
                        title="Delete"
                      >
                        <Trash2
                          size={16}
                        />
                      </button>

                    </div>

                  </div>

                </article>
              )
            )}

          </section>
        )}


      {/* =====================================================
          BULK BAR + PAGINATION
      ====================================================== */}

      {!loading &&
        filteredGallery.length >
          0 && (
          <footer className="admin-gallery__footer">

            <div className="admin-gallery__bulk">

              <label>
                <input
                  type="checkbox"
                  checked={
                    allVisibleSelected
                  }
                  onChange={
                    toggleVisible
                  }
                />

                <span>
                  {
                    selectedIds.size
                  }{" "}
                  selected
                </span>
              </label>


              {selectedIds.size >
                0 && (
                <>
                  <button
                    type="button"
                    disabled={
                      bulkLoading
                    }
                    onClick={() =>
                      bulkStatus(
                        "published"
                      )
                    }
                  >
                    Publish
                  </button>

                  <button
                    type="button"
                    disabled={
                      bulkLoading
                    }
                    onClick={() =>
                      bulkStatus(
                        "draft"
                      )
                    }
                  >
                    Unpublish
                  </button>

                  <button
                    type="button"
                    className="is-danger"
                    disabled={
                      bulkLoading
                    }
                    onClick={
                      bulkDelete
                    }
                  >
                    Delete
                  </button>
                </>
              )}

            </div>


            <div className="admin-gallery__pagination">

              <div className="admin-gallery__page-size">
                <span>
                  Show
                </span>

                <select
                  value={
                    pageSize
                  }
                  onChange={(
                    event
                  ) =>
                    setPageSize(
                      Number(
                        event.target.value
                      )
                    )
                  }
                >
                  {PAGE_SIZE_OPTIONS.map(
                    (size) => (
                      <option
                        key={
                          size
                        }
                        value={
                          size
                        }
                      >
                        {size}
                      </option>
                    )
                  )}
                </select>
              </div>


              <span className="admin-gallery__range">
                {filteredGallery.length ===
                0
                  ? "0"
                  : (page - 1) *
                      pageSize +
                    1}
                {" – "}
                {Math.min(
                  page *
                    pageSize,
                  filteredGallery.length
                )}
                {" of "}
                {
                  filteredGallery.length
                }
              </span>


              <button
                type="button"
                disabled={
                  page <= 1
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      Math.max(
                        1,
                        current - 1
                      )
                  )
                }
              >
                <ChevronLeft
                  size={17}
                />
              </button>


              {pageNumbers.map(
                (number) => (
                  <button
                    key={
                      number
                    }
                    type="button"
                    className={
                      number ===
                      page
                        ? "is-active"
                        : ""
                    }
                    onClick={() =>
                      setPage(
                        number
                      )
                    }
                  >
                    {number}
                  </button>
                )
              )}


              <button
                type="button"
                disabled={
                  page >=
                  totalPages
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      Math.min(
                        totalPages,
                        current + 1
                      )
                  )
                }
              >
                <ChevronRight
                  size={17}
                />
              </button>

            </div>

          </footer>
        )}


      {/* =====================================================
          UPLOAD MODAL
      ====================================================== */}

      {uploadOpen && (
        <div
          className="admin-gallery-modal"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="admin-gallery-modal__backdrop"
            onClick={
              closeUpload
            }
          />

          <form
            className="admin-gallery-modal__panel"
            onSubmit={
              handleCreate
            }
          >

            <div className="admin-gallery-modal__header">

              <div>
                <h2>
                  Add Photos
                </h2>

                <p>
                  Upload new photos to
                  the website gallery.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeUpload
                }
                disabled={
                  submitting
                }
              >
                <X
                  size={20}
                />
              </button>

            </div>


            <div className="admin-gallery-modal__body">

              <div
                className="admin-gallery-upload"
                onDragOver={(
                  event
                ) =>
                  event.preventDefault()
                }
                onDrop={(event) => {
                  if (submitting) {
                    event.preventDefault();
                    return;
                  }
                  handleDrop(event);
                }}
                onClick={() => {
                  if (!submitting) {
                    fileInputRef.current?.click();
                  }
                }}
              >

                <Upload
                  size={35}
                />

                <strong>
                  Upload Photos
                </strong>

                <p>
                  Drag and drop images
                  here, or click to browse
                </p>

                <small>
                  JPG, PNG or WebP.
                  Maximum 10MB each.
                </small>

                <input
                  ref={
                    fileInputRef
                  }
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  hidden
                  onChange={
                    handleFileInput
                  }
                  disabled={submitting}
                />

              </div>


              {files.length >
                0 && (
                <div className="admin-gallery-upload__previews">

                  {files.map(
                    (item) => (
                      <div
                        key={
                          item.id
                        }
                        className="admin-gallery-upload__preview"
                      >
                        <img
                          src={
                            item.preview
                          }
                          alt=""
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeFile(
                              item.id
                            )
                          }
                          disabled={submitting}
                        >
                          <X
                            size={13}
                          />
                        </button>
                      </div>
                    )
                  )}


                  <button
                    type="button"
                    className="admin-gallery-upload__more"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    disabled={submitting}
                  >
                    <Plus
                      size={22}
                    />
                  </button>

                </div>
              )}

              {files.length > 0 && (
                <div className="admin-gallery-upload__summary">
                  <span>
                    {files.length} photo{files.length === 1 ? "" : "s"} selected
                  </span>
                  <span>Maximum 10MB per image</span>
                </div>
              )}

              {submitting && uploadProgress.total > 0 && (
                <div className="admin-gallery-upload__progress" aria-live="polite">
                  <div className="admin-gallery-upload__progress-head">
                    <strong>Uploading photos</strong>
                    <span>
                      {uploadProgress.completed} / {uploadProgress.total}
                    </span>
                  </div>
                  <div className="admin-gallery-upload__progress-track">
                    <span
                      style={{
                        width: `${Math.round((uploadProgress.completed / uploadProgress.total) * 100)}%`,
                      }}
                    />
                  </div>
                  <small>
                    {uploadProgress.currentName
                      ? `Uploading ${uploadProgress.currentName}`
                      : "Finishing upload..."}
                  </small>
                </div>
              )}


              <div className="admin-gallery-form">

                <label>
                  <span>
                    Title *
                  </span>

                  <input
                    type="text"
                    value={
                      form.title
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "title",
                        event.target.value
                      )
                    }
                    placeholder="Enter photo title"
                    maxLength={160}
                    required
                  />
                </label>


                <label>
                  <span>
                    Caption
                  </span>

                  <textarea
                    value={
                      form.caption
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "caption",
                        event.target.value
                      )
                    }
                    placeholder="Enter a short description..."
                    rows={4}
                    maxLength={1000}
                  />
                </label>


                <div className="admin-gallery-form__row">

                  <label>
                    <span>
                      Category *
                    </span>

                    <input
                      type="text"
                      list="gallery-categories"
                      value={
                        form.category
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "category",
                          event.target.value
                        )
                      }
                      placeholder="e.g. Events"
                      required
                    />

                    <datalist id="gallery-categories">
                      {categories.map(
                        (
                          category
                        ) => (
                          <option
                            key={
                              category
                            }
                            value={
                              category
                            }
                          />
                        )
                      )}
                    </datalist>
                  </label>


                  <label>
                    <span>
                      Date
                    </span>

                    <input
                      type="date"
                      value={
                        form.eventDate
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "eventDate",
                          event.target.value
                        )
                      }
                    />
                  </label>

                </div>


                <label>
                  <span>
                    Alternative text
                  </span>

                  <input
                    type="text"
                    value={
                      form.altText
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "altText",
                        event.target.value
                      )
                    }
                    placeholder="Describe the image for accessibility"
                    maxLength={250}
                  />
                </label>


                <label>
                  <span>
                    Status
                  </span>

                  <select
                    value={
                      form.status
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "status",
                        event.target.value
                      )
                    }
                  >
                    <option value="published">
                      Published
                    </option>

                    <option value="draft">
                      Draft
                    </option>
                  </select>
                </label>

              </div>

            </div>


            <div className="admin-gallery-modal__footer">

              <button
                type="button"
                className="is-secondary"
                onClick={
                  closeUpload
                }
                disabled={
                  submitting
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                className="is-primary"
                disabled={
                  submitting
                }
              >
                {submitting ? (
                  <>
                    <LoaderCircle
                      className="is-spinning"
                      size={17}
                    />

                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload
                      size={17}
                    />

                    {files.length > 1
                      ? `Upload ${files.length} Photos`
                      : "Upload Photo"}
                  </>
                )}
              </button>

            </div>

          </form>
        </div>
      )}


      {/* =====================================================
          EDIT MODAL
      ====================================================== */}

      {editItem && (
        <div
          className="admin-gallery-modal"
          role="dialog"
          aria-modal="true"
        >

          <div
            className="admin-gallery-modal__backdrop"
            onClick={() =>
              !submitting &&
              setEditItem(
                null
              )
            }
          />

          <form
            className="admin-gallery-modal__panel admin-gallery-modal__panel--edit"
            onSubmit={
              handleEdit
            }
          >

            <div className="admin-gallery-modal__header">

              <div>
                <h2>
                  Edit Photo
                </h2>

                <p>
                  Update gallery
                  information and
                  publishing status.
                </p>
              </div>

              <button
                type="button"
                disabled={
                  submitting
                }
                onClick={() =>
                  setEditItem(
                    null
                  )
                }
              >
                <X
                  size={20}
                />
              </button>

            </div>


            <div className="admin-gallery-modal__body">

              {editItem.imageUrl && (
                <div className="admin-gallery-edit__image">
                  <img
                    src={
                      editItem.imageUrl
                    }
                    alt={
                      editItem.altText ||
                      editItem.title
                    }
                  />
                </div>
              )}


              <div className="admin-gallery-form">

                <label>
                  <span>
                    Title *
                  </span>

                  <input
                    type="text"
                    value={
                      form.title
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "title",
                        event.target.value
                      )
                    }
                    required
                  />
                </label>


                <label>
                  <span>
                    Caption
                  </span>

                  <textarea
                    value={
                      form.caption
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "caption",
                        event.target.value
                      )
                    }
                    rows={4}
                  />
                </label>


                <div className="admin-gallery-form__row">

                  <label>
                    <span>
                      Category *
                    </span>

                    <input
                      type="text"
                      list="gallery-edit-categories"
                      value={
                        form.category
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "category",
                          event.target.value
                        )
                      }
                      required
                    />

                    <datalist id="gallery-edit-categories">
                      {categories.map(
                        (
                          category
                        ) => (
                          <option
                            key={
                              category
                            }
                            value={
                              category
                            }
                          />
                        )
                      )}
                    </datalist>
                  </label>


                  <label>
                    <span>
                      Date
                    </span>

                    <input
                      type="date"
                      value={
                        form.eventDate
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "eventDate",
                          event.target.value
                        )
                      }
                    />
                  </label>

                </div>


                <label>
                  <span>
                    Alternative text
                  </span>

                  <input
                    type="text"
                    value={
                      form.altText
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "altText",
                        event.target.value
                      )
                    }
                  />
                </label>


                <label>
                  <span>
                    Status
                  </span>

                  <select
                    value={
                      form.status
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "status",
                        event.target.value
                      )
                    }
                  >
                    <option value="published">
                      Published
                    </option>

                    <option value="draft">
                      Draft
                    </option>
                  </select>
                </label>

              </div>

            </div>


            <div className="admin-gallery-modal__footer">

              <button
                type="button"
                className="is-secondary"
                disabled={
                  submitting
                }
                onClick={() =>
                  setEditItem(
                    null
                  )
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                className="is-primary"
                disabled={
                  submitting
                }
              >
                {submitting ? (
                  <>
                    <LoaderCircle
                      className="is-spinning"
                      size={17}
                    />

                    Saving...
                  </>
                ) : (
                  <>
                    <Check
                      size={17}
                    />

                    Save Changes
                  </>
                )}
              </button>

            </div>

          </form>
        </div>
      )}


      {/* =====================================================
          DELETE CONFIRMATION
      ====================================================== */}

      {deleteItem && (
        <div
          className="admin-gallery-modal"
          role="dialog"
          aria-modal="true"
        >

          <div
            className="admin-gallery-modal__backdrop"
            onClick={() =>
              actionId === null &&
              setDeleteItem(
                null
              )
            }
          />


          <div className="admin-gallery-delete">

            <div className="admin-gallery-delete__icon">
              <Trash2
                size={24}
              />
            </div>

            <h2>
              Delete Photo?
            </h2>

            <p>
              You are about to
              permanently delete{" "}
              <strong>
                {deleteItem.title ||
                  "this photo"}
              </strong>
              . This action cannot be
              undone.
            </p>


            <div className="admin-gallery-delete__actions">

              <button
                type="button"
                disabled={
                  actionId !==
                  null
                }
                onClick={() =>
                  setDeleteItem(
                    null
                  )
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="is-danger"
                disabled={
                  actionId !==
                  null
                }
                onClick={
                  handleDelete
                }
              >
                {actionId ===
                deleteItem.id ? (
                  <LoaderCircle
                    className="is-spinning"
                    size={17}
                  />
                ) : (
                  <Trash2
                    size={17}
                  />
                )}

                Delete Photo
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}