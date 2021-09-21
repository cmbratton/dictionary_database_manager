<?php
/**
 * a program to add a word entry to the 
 * word list database. Checks if word is already
 * in database before insert query is provided.
 * @author Colby Bratton
 * @version 12 Apr 2021
 */

error_reporting(E_ALL);
ini_set('display_errors', '1');

require('../../cs315/dblogin.php');

if (!isset($_POST) ||
    !isset($_POST['word']) || !preg_match('/^[A-Za-z]+$/', $_POST['word']) ||
    !isset($_POST['part']) ||
    !isset($_POST['definition']) ||
    !preg_match('/^(?!\s*$).+/', $_POST['definition']))
{
  exit();
}

$db = new PDO(
  "mysql:host=$db_hostname;dbname=cmb7742;charset=utf8",
  $db_username, $db_password,
  array(PDO::ATTR_EMULATE_PREPARES => false,
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION));

// check if word is already in database
$sql_check = 'select word
              from entry
              where word = :word and part_of_speech = :part';

// if not, add it
$sql_add = 'insert into entry (word, part_of_speech, definition)
            values (:word, :part, :definition)';

$word = strtolower($_POST['word']);
$part = $_POST['part'];
$definition = htmlspecialchars($_POST['definition']);

$statement = $db->prepare($sql_check);
$statement->bindValue(':word', $word);
$statement->bindValue(':part', $part);
$statement->execute();
$results = $statement->fetchAll(PDO::FETCH_ASSOC);

if (count($results) > 0)
{
  echo false;
}
else
{
  $success_rate = false;
  
  $statement = $db->prepare($sql_add);
  $statement->bindValue(':word', $word);
  $statement->bindValue(':part', $part);
  $statement->bindValue(':definition', $definition);
  $success_rate = $statement->execute();
  
  echo $success_rate;
}
?>
