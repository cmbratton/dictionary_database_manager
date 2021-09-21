<?php
/**
 * a program to delete a list of supplied words from
 * the word list database
 * @author Colby Bratton
 * @version 11 Apr 2021
 */

error_reporting(E_ALL);
ini_set('display_errors', '1');

require('../../cs315/dblogin.php');

if (!isset($_POST) || !isset($_POST['words_to_delete']))
{
  exit();
}

$db = new PDO(
  "mysql:host=$db_hostname;dbname=cmb7742;charset=utf8",
  $db_username, $db_password,
  array(PDO::ATTR_EMULATE_PREPARES => false,
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION));

$sql = 'delete from entry
        where word = :word and part_of_speech = :part';

$idlist = json_decode($_POST['words_to_delete']);

$success_rate = false;
foreach ($idlist as $row)
{
  $word = strtok($row, '_');
  $part = strtok('');
  
  $statement = $db->prepare($sql);
  $statement->bindValue(':word', $word);
  $statement->bindValue(':part', $part);
  $success_rate = $statement->execute();
}

echo $success_rate;
?>
