<?php
// Serve the new index.html content directly, bypassing LiteSpeed cache
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");
readfile(__DIR__ . '/index.html');
exit;
?>