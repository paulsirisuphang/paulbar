/* ================================================================
   THE SHARED ORDER BOOK
   The bar's Firestore project. Fill these in and every phone reads and
   writes the same list; leave them empty and orders stay on the device
   that placed them. These are the web app's public settings, made to
   ship in a page: the database's own rules (see the README) decide what
   anyone may do with them. The test build blanks them, so a test run
   never writes into the real list.
   ================================================================ */

const BOOK = {
  apiKey: 'AIzaSyCaG-8o22ep4mA2ww3X-c0KHQRB4rpL2tI',
  authDomain: 'paulsbar.firebaseapp.com',
  projectId: 'paulsbar',
  appId: '1:508959693857:web:58410ffa0bc7d7171d5760'
};
