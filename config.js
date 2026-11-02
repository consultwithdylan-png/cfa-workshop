// ===== Edit these and redeploy =====
window.CFA_CONFIG = {
  // Upcoming workshops, oldest first. The page always shows the next one that
  // hasn't ended yet (each is treated as over 2 hours after its start).
  // start: ISO date/time with Eastern offset (-05:00 Nov–Mar, -04:00 Mar–Nov)
  // label: shown on the page and sent to GHL for emails/texts
  // zoom:  join link sent to GHL with each registration
  workshops: [
    {
      start: "2026-11-07T20:00:00-05:00",
      label: "Saturday, Nov 7 @ 8:00 PM EST",
      zoom: "https://us06web.zoom.us/j/89514257607?pwd=wRS4Er2rbsJDrdFR6qlPgX6HvL8UIj.1"
    }
  ],
  workshopLengthHours: 2,

  // GoHighLevel inbound webhook URL (Automation > Workflow > Inbound Webhook trigger).
  ghlWebhookUrl: "https://services.leadconnectorhq.com/hooks/1BTr0PfdShOJjKXWB7Ab/webhook-trigger/4488126d-6ea2-4080-b360-fb0549a64e36",

  // Where people land after registering
  thankYouPage: "thank-you.html"
};
