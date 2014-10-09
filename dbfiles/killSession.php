<?php
session_start();
//remove the session database folder recursively
rrmdir($_SESSION['id']); //This function is defined below
//Source: http://stackoverflow.com/questions/3948230/best-way-to-completely-destroy-a-session-even-if-the-browser-is-not-closed
// Unset all of the session variables.
$_SESSION = array();
// If it's desired to kill the session, also delete the session cookie.
// Note: This will destroy the session, and not just the session data!
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(),
        '',
        time() - 42000,
        $params["path"],
        $params["domain"],
        $params["secure"],
        $params["httponly"]
    );
}
//Finally, destroy the session.
session_destroy();
//Source: http://php.net/manual/en/function.rmdir.php
function rrmdir($dir) {
   if (is_dir($dir)) {
     $objects = scandir($dir);
     foreach ($objects as $object) {
       if ($object != "." && $object != "..") {
         if (filetype($dir . "/" . $object) == "dir") rrmdir($dir."/".$object); else unlink($dir."/".$object);
       }
     }
     reset($objects);
     rmdir($dir);
   }
 }
?>