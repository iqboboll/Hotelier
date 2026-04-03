CREATE TABLE User (
    userID INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL
);

CREATE TABLE Guest (
    guestID INT AUTO_INCREMENT PRIMARY KEY,
    fullName VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phoneNumber VARCHAR(20) NOT NULL
);

CREATE TABLE Room (
    roomID INT AUTO_INCREMENT PRIMARY KEY,
    roomType VARCHAR(50) NOT NULL,
    priceRate DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL
);

CREATE TABLE Booking (
    bookingID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT,
    guestID INT,
    roomID INT,
    checkInDate DATE NOT NULL,
    checkOutDate DATE NOT NULL,
    FOREIGN KEY (userID) REFERENCES User(userID),
    FOREIGN KEY (guestID) REFERENCES Guest(guestID),
    FOREIGN KEY (roomID) REFERENCES Room(roomID)
);

CREATE TABLE Facilities (
    facilID INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    location VARCHAR(100),
    priceRate DECIMAL(10,2) NOT NULL
);

CREATE TABLE Transaction (
    transactionID INT AUTO_INCREMENT PRIMARY KEY,
    bookingID INT,
    totalAmount DECIMAL(10,2) NOT NULL,
    paymentDate DATETIME,
    FOREIGN KEY (bookingID) REFERENCES Booking(bookingID)
);