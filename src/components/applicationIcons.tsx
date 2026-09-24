/**
 * One line drawing per building type, in the same hand as the tab-bar icons:
 * a single stroke weight, square ends, 24-unit box, no fills.
 *
 * They are drawings of BUILDINGS, not symbols for ideas — a silo is a silo and
 * a mall has an atrium — because the page is a list of things this company
 * puts up, and a page of abstract glyphs would say nothing the heading does
 * not already say.
 */
export const APPLICATION_ICONS: Record<string, string> = {
  /* A wide block with a barrel-vaulted atrium over the entrance. */
  mall: 'M3 20h18M4.5 20v-9h15v9M8 11a4 4 0 0 1 8 0M10 20v-4h4v4',
  /* A trolley. */
  market: 'M3 4h2.5l2.2 10.5h9.6L19 7H6.2M9 19.5h.01M17 19.5h.01',
  /* A tower with floor plates. */
  office: 'M6 20V4.5h12V20M3.5 20h17M9 8h2M13 8h2M9 12h2M13 12h2M9 16h2M13 16h2',
  /* A glazed frontage under a canopy. */
  showroom: 'M3.5 9.5 5.5 5h13l2 4.5M3.5 9.5V20h17V9.5M3.5 9.5h17M9 20v-6.5h6V20',
  /* A schoolhouse with a flag. */
  school: 'M3 11 12 6l9 5M5.5 12v8h13v-8M12 6V3.5h3.5V5H12M9.5 20v-4.5h5V20',
  /* A cross on a block. */
  hospital: 'M5 20V7h14v13M3.5 20h17M12 10v6M9 13h6',
  /* A platform canopy over a train. */
  transport: 'M3 7h18M5 7v7a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V7M9 17l-2 3M15 17l2 3M8.5 11h7',
  /* A stand roof over a pitch. */
  sports: 'M3 13a9 5 0 0 1 18 0M3 13v5h18v-5M7.5 18v-3.5M16.5 18v-3.5M12 8.5V13',
  /* A wide hall with a folding partition. */
  convention: 'M3 19.5h18M4.5 19.5V9l7.5-4.5L19.5 9v10.5M12 4.5v15M8 19.5V13h8v6.5',
  /* A block with a portico and a flag over the door. */
  hotel: 'M5 20V4.5h14V20M3.5 20h17M8.5 8h2M13.5 8h2M8.5 12h2M13.5 12h2M10.5 20v-4h3v4',
  /* An insulated box with a snowflake. */
  cold: 'M4.5 5h15v14h-15zM12 8.5v7M9 10.2l6 3.6M15 10.2l-6 3.6',
  /* A long ventilated shed with a monopitch roof. */
  livestock: 'M3 11.5 12 6.5l9 5M4.5 11.5V19.5h15V11.5M8 19.5v-4h3v4M14 19.5v-4h3v4',
  /* Two silos beside a processing block. */
  silo: 'M4 20V10a2.5 2.5 0 0 1 5 0v10M10.5 20V10a2.5 2.5 0 0 1 5 0v10M17 20v-7h4v7M2.5 20h19',

  /* ── What comes off the roofing line ─────────────────────────────────── */
  /* The trapezoidal rib, in section. */
  trapezoid: 'M2 16h3l2-6h3l2 6h3l2-6h3M2 20h20',
  /* A tile profile's wave, in section. */
  tile: 'M2.5 15c1.5 0 1.5-4 3.5-4s2 4 3.5 4 1.5-4 3.5-4 2 4 3.5 4 1.5-4 3.5-4M2.5 19.5h19',
  /* Two skins with a core between them. */
  panel: 'M3 8.5h18M3 12h18M3 15.5h18M3 8.5v7M21 8.5v7M7 12v3.5M11 12v3.5M15 12v3.5',
  /* A gutter section under a roof edge. */
  gutter: 'M3 7l7 5M4.5 14.5h13a2.5 2.5 0 0 1 0 5h-13zM4.5 14.5v5',
  /* A rolled section on a drawing sheet. */
  drawing: 'M4.5 4.5h15v15h-15zM8 15.5V11l2-2.5 2 2.5v4.5M12 11h4M7.5 19.5v-2M16.5 19.5v-2',
}
