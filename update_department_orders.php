<?php
// Standalone script to add order column and update existing departments
// Run this file directly to update department orders manually

// Database configuration - update these to match your database settings
$host = 'localhost'; // or your database host
$dbname = 'camt_portalDB'; // your database name
$username = 'root'; // your database username  
$password = ''; // your database password

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Connected to database successfully\n";
    
    // Check if order column exists
    $stmt = $pdo->query("SHOW COLUMNS FROM departments LIKE 'order'");
    $orderColumnExists = $stmt->rowCount() > 0;
    
    if (!$orderColumnExists) {
        echo "Adding order column to departments table...\n";
        $pdo->exec("ALTER TABLE departments ADD COLUMN `order` INT DEFAULT 0 AFTER icon_path");
        echo "Order column added successfully\n";
    } else {
        echo "Order column already exists\n";
    }
    
    // Update existing departments with order values
    echo "Updating existing departments with order values...\n";
    $stmt = $pdo->query("SELECT id FROM departments ORDER BY id");
    $departments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($departments as $index => $department) {
        $updateStmt = $pdo->prepare("UPDATE departments SET `order` = ? WHERE id = ?");
        $updateStmt->execute([$index, $department['id']]);
        echo "Updated department ID {$department['id']} with order $index\n";
    }
    
    echo "All departments updated successfully!\n";
    echo "You can now test the drag and drop functionality.\n";
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "\nPlease update the database configuration in this file:\n";
    echo "- Host: $host\n";
    echo "- Database: $dbname\n";
    echo "- Username: $username\n";
    echo "- Password: [hidden]\n";
}
?> 