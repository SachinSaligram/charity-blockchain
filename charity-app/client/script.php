<?php
$servername = "localhost";
$username = "root";
$password = "root";
$dbname = "mydb";

// Create connection
$conn = mysqli_connect($servername, $username, $password, $dbname);
// Check connection
if (!$conn) {
die("Connection failed: " . mysqli_connect_error());
}

$sql = "SELECT * FROM charity";
$result = mysqli_query($conn, $sql);

echo "<table>
<tr>
<th>Charity</th>
<th>Event</th>
<th>Target</th>
<th>Balance</th>
</tr>";

while($row = mysqli_fetch_array($result))
{
echo "<tr>";
echo "<td>" . $row['Charity'] . "</td>";
echo "<td>" . $row['Event'] . "</td>";
echo "<td>" . $row['Target'] . "</td>";
echo "<td>" . $row['Balance'] . "</td>";
echo "</tr>";
}
echo "</table>";

mysqli_close($conn);
?>