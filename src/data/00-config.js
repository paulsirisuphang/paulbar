/* ================================================================
   THE SHARED ORDER BOOK
   Fill these in and every phone reads and writes the same list; leave
   them empty and orders stay on the device that placed them. The key
   is Supabase's *publishable* key — it is meant to ship in the page,
   and the table's own policies decide what it may do. The test build
   blanks both so a test run never writes into the real list.
   ================================================================ */

const BOOK = {
  url: 'https://udyvhtrdrulpgxygznoc.supabase.co',
  key: 'sb_publishable_bmOxYURr-Weyou44QT45uA_79tzZcqH'
};
