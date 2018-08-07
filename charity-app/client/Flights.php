<?php
$conn = mysqli_connect("localhost","root","root",'charity');
$data = array();
// Check connection
if (!$conn)
{
    die("Connection failed: " . mysqli_connect_error());
}
else
{      
    $sql = "select * from charity";
    $result = $conn->query($sql);

    $outp = array();
    while( $rs = $result->fetch_array(MYSQLI_ASSOC)) {
        $outp[] = $rs;
    }
    echo json_encode($outp);
}
?>