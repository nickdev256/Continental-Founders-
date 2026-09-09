const supabase = require("../config/supabase");

async function getEvents(req, res) {
  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true });

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      events: data,
    });
  } catch (error) {
    console.error("Get events error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load events.",
    });
  }
}

async function getEventBySlug(req, res) {
  try {
    const { slug } = req.params;

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      event: data,
    });
  } catch (error) {
    console.error("Get event error:", error);

    res.status(404).json({
      success: false,
      message: "Event not found.",
    });
  }
}

module.exports = {
  getEvents,
  getEventBySlug,
};