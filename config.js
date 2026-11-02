// ===== Edit these and redeploy =====
window.CFA_CONFIG = {
  // Weekly workshop that repeats on its own. The page always shows the next
  // upcoming session (a session counts as over 2 hours after it starts).
  schedule: {
    weekday: "Saturday",   // Sunday ... Saturday
    time: "20:00",         // 24-hour clock, Eastern time
    zoom: "https://us06web.zoom.us/j/89514257607?pwd=wRS4Er2rbsJDrdFR6qlPgX6HvL8UIj.1",
    skip: []               // weeks you're off, e.g. ["2026-11-28"]
  },

  // Optional one-off sessions on a different day/time. They're mixed in with
  // the weekly ones; leave empty if you don't need any.
  // { start: "2026-12-03T19:00:00-05:00", zoom: "https://..." }
  // (Eastern offset: -05:00 Nov–Mar, -04:00 Mar–Nov)
  workshops: [],

  workshopLengthHours: 2,

  // Must match GHL Settings > Business Profile > Time Zone. GHL reads the
  // reminder time in that zone. (Account is on Pacific right now; if you switch
  // it to Eastern, change this to "America/New_York".)
  ghlTimeZone: "America/Los_Angeles",

  // GoHighLevel inbound webhook URL (Automation > Workflow > Inbound Webhook trigger).
  ghlWebhookUrl: "https://services.leadconnectorhq.com/hooks/1BTr0PfdShOJjKXWB7Ab/webhook-trigger/4488126d-6ea2-4080-b360-fb0549a64e36",

  // Where people land after registering
  thankYouPage: "thank-you.html"
};
