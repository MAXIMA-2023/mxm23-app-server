-- DATABASE dev versi 25 agus 2023
-- UPDATE:
-- add external table
-- add property alfagiftid untuk maba dan external
-- add isAttendedMalpun untuk maba dan external
-- add ticketClaimed untuk maba
-- add ticketBuyed untuk external

-- DATABASE dev versi 25 agus 2023
-- UPDATE:
-- fix external table primary to transactionID
-- added dummy transaction table

CREATE TABLE `divisi` (
  `divisiID` char(3) NOT NULL, 
  `name` varchar(32) NOT NULL, 
  PRIMARY KEY (`divisiID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `divisi` (`divisiID`, `name`) VALUES
('D01', 'UNITUM'), 
('D02', 'FACIO'), 
('D03', 'EFFIGIA'),
('D04', 'ORNATUS'),
('D05', 'EVENTUS'),
('D06', 'SERVANDA'),
('D07', 'MERCATURA'),
('D08', 'NUNTIUM'),
('D09', 'LAMMINA'),
('D10', 'FIDUCIA'), 
('D11', 'EMPORIUM'),
('D12', 'VIDERE'), 
('D13', 'INSPICE'),
('D14', 'ARMATURA'),
('D15', 'NOVUS'); 

-- --------------------------------------------------------

-- penampungan data untuk mahasiswa
-- note: yang bisa signup hanya angkatan 23 atau maba
CREATE TABLE `mahasiswa` (
  `name` varchar(255) NOT NULL,
  `nim` int(11) NOT NULL,
  `password` varchar(255) NOT NULL,
  `whatsapp` varchar(15) NOT NULL,
  `email` varchar(255) NOT NULL,
  `angkatan` year(4) NOT NULL,
  `idLine` varchar(32) NOT NULL,
  `prodi` varchar(32) NOT NULL,
  `token` varchar(32) NOT NULL,
  `created_at` datetime DEFAULT NOW(),
  `alfagiftID` varchar(16) DEFAULT 0,
  `ticketClaimed` tinyint(1) DEFAULT 0,
  `isAttendedMalpun` tinyint DEFAULT 0,
  PRIMARY KEY (`nim`) 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `mahasiswa` (`name`, `nim`, `password`, `whatsapp`, `email`, `angkatan`, `idLine`, `prodi`, `token`) VALUES
('Dummy', 88484, 'TdkBisaDipakekBuatLogin', '080809090707', 'tes@student.umn.ac.id', 2023,'dummylineid', 'Informatika', 'MXM23-88484'),
('henry', 66484, '$2a$10$7XBGYMXUE6vsYUv/ohsgr.QrKR1efpEyQ9BnEhJBrrzjg.iorAgIy', '0852', 'gilbert.henry@student.umn.ac.id', 2023,'lineidgilbert', 'Infor', 'MXM23-66484');

-- --------------------------------------------------------
CREATE TABLE `dummytransaction`(
  `transactionID` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY(`transactionID`)
)Engine=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `dummytransaction` (`transactionID`) VALUES
(1);

CREATE TABLE `external` (
  `transactionID` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `whatsapp` varchar(15) NOT NULL,
  `email` varchar(255) NOT NULL,
  `token` varchar(32) NOT NULL,
  `created_at` datetime DEFAULT NOW(),
  `alfagiftID` varchar(16) DEFAULT 0,
  `ticketBuyed` tinyint(1) DEFAULT 0,
  `isAttendedMalpun` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`transactionID`),
  FOREIGN KEY (`transactionID`) REFERENCES dummytransaction(`transactionID`) ON DELETE CASCADE ON UPDATE CASCADE 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `external`( `transactionID`, `name`, `whatsapp`, `email`, `token`) VALUES
(1, 'Dummy External', '080809090707', 'external@gmail.com', 'MXM23-1');


-- ------------------------------------------------------------

-- untuk menampung data berupa tgl dan waktu kapan suatu state dilaksanakan
-- dibuat tabel ini agar jika ingin mengedit jam pada satu hari, tidak perlu mengedit satu persatu pada tabel state_activities
CREATE TABLE `day_management` (
  `day` varchar(3) NOT NULL, 
  `hari` int(11) NOT NULL, 
  `date` datetime NOT NULL,
  PRIMARY KEY (`day`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- template aja ini, nanti diubah sesuai kebutuhan
INSERT INTO `day_management` (`day`, `hari`, `date`) VALUES
('D1', 1, '2023-09-05 17:00:00'),
('D2', 2, '2023-09-06 17:00:00'),
('D3', 3, '2023-09-07 17:00:00'),
('D4', 4, '2023-09-08 17:00:00'),
('D5', 5, '2023-09-09 17:00:00'),
('D6', 6, '2023-09-12 17:00:00'),
('D7', 7, '2023-09-13 17:00:00');

-- --------------------------------------------------------

-- penampungan data untuk kegiatan state yang dibuat oleh organisator
-- day merupakan foreign key dari day_management, menandakan state tersebut dilaksanakan pada hari apa
-- stateLogo untuk menyimpan link gambar logo state
-- quota untuk menyimpan jumlah kuota peserta state yang akan diset oleh organisator atau set default oleh MAXIMA
-- registered untuk menyimpan jumlah peserta yang sudah terdaftar state
CREATE TABLE `state_activities` (
  `stateID` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `day` varchar(3) NOT NULL, 
  `stateLogo` varchar(255) NOT NULL,
  `stateDesc` TEXT NOT NULL, 
  `location` varchar(255) NOT NULL,
  `quota` int(11) NOT NULL, 
  `registered` int(11) NOT NULL,
  PRIMARY KEY (`stateID`),
  FOREIGN KEY (`day`) REFERENCES day_management(`day`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `state_activities`(`name`, `day`, `stateLogo`, `stateDesc`, `location`, `quota`, `registered`)
VALUES 
('Ultima Sonora', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('Lions Volley', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('Ultimagz', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('J-cafe Cosplay', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('J-Cafe Culture', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('J-Cafe Illustration', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('J-Cafe Music', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('J-Cafe Weaponry', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('J-Cafe Visual Novel', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('J-Cafe TCG', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('Lions Basket', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('UMN Documentation', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('UMN Taekwondo', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('Street Dance', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('Capoiera', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('Radar UMN', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('UESC Scrabble', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('UESC Spelling bee', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('UESC Speech', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('CAMVIS', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('Lions Tenis Meja', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('UMN PC', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('Obscura', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('UMN TV', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('USO', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('Ultima Aikido', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('Tracce Reguler', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('Tracce Ratoh Jatoe', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('HM Film', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('Fortius', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('Teater KataK Aktor', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('Teater KataK Properti', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('Teater KataK Make Up', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('Teater KataK Music', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('Lions Futsal', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('U-Toys', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('HIMARS', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('Kompas Corner', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('Duta Anti Narkoba', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('Ikatan Bikers', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('Spectre', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('Skystar venture', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('KSPM', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('Mufomic', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('UMN Medic', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('Nusakara', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('Rencang', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('Lions Badminton', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('Game Development Club', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('UMN Robotic Club', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('UMN Juice', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('MAPALA', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('U-Biz', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('POPSICLE UMN', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('UMN Radio', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('Qorie K-Code Boy Group', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('Qorie K-Code Girl Group', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('Qorie K-Voice', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('Qorie Hantalk', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('Rumpin', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('Board Games', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('ACES', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('HMDKV', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('UMN Gate', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0),
('HIMFERA', 'D1', 'logo state', 'deskripsi state', 'di UMN', 50, 0);

-- --------------------------------------------------------

-- table dari mahasiswa x state_activities (m*n relation), untuk menampung data peserta yang mendaftar state apa
-- attendanceTime untuk menampung waktu peserta melakukan absen
-- isFirstAttended untuk menampung apakah peserta sudah absen awal atau belum
-- isLastAttended untuk menampung apakah peserta sudah absen akhir atau belum
CREATE TABLE `state_registration` (
  `stateID` int(11) NOT NULL,
  `nim` int(11) NOT NULL,
  `attendanceTime` datetime DEFAULT NULL,
  `isFirstAttended` tinyint(1) NOT NULL,
  `isLastAttended` tinyint(1) NOT NULL,
  `created_at` datetime DEFAULT NOW(),  
  PRIMARY KEY (`stateID`, `nim`),
  FOREIGN KEY (`stateID`) REFERENCES state_activities(`stateID`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`nim`) REFERENCES mahasiswa(`nim`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `state_registration` (`stateID`, `nim`, `attendanceTime`, `isFirstAttended`, `isLastAttended`) VALUES
(1, 66484, NULL, 0, 0),
(8, 66484, NULL, 0, 0),
(11, 66484, NULL, 0, 0),
(2, 88484, NULL, 0, 0),
(9, 88484, NULL, 0, 0);

-- --------------------------------------------------------

-- penampungan data untuk organisator/PIC LSO dan UKM yang ingin buat state
-- stateID merupakan foreign key dari state_activities, menandakan organisator tersebut merukapan PIC dari state tersebut
-- isverified untuk menandakan apakah organisator tersebut sudah diverifikasi oleh BPH/FACIO atau belum
CREATE TABLE `organisator` (
  `nim` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `stateID` int(11) NOT NULL,
  `isverified` tinyint(1) NOT NULL, 
  PRIMARY KEY (`nim`),
  FOREIGN KEY (`stateID`) REFERENCES state_activities(`stateID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `organisator` (`nim`, `name`, `email`, `password`, `stateID`, `isverified`) VALUES
(66484, 'Ketua USO', 'ketua.sonora@student.umn.ac.id', 'TIDAKBISADIPAKEKBUATLOGIN', 1, 0),
(1111, 'Organisator USO', 'organisator.sonora@student.umn.ac.id', '$2a$08$SvzgBuGR3Ucgfkkw1JFvY.nF8Yd8G/97gouGefRvjwcuQU3CBy7Y6', 1, 1);
-- --------------------------------------------------------

-- penampungan data untuk panitia/agents MAXIMA 23
-- divisionID merupakan foreign key dari tabel divisi
-- isverified untuk menandakan apakah panitia tersebut sudah diverifikasi oleh BPH/FACIO atau belum
CREATE TABLE `panitia` (
  `name` varchar(255) NOT NULL,
  `nim` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `divisiID` char(3) NOT NULL,
  `isverified` tinyint(1) NOT NULL, 
  PRIMARY KEY (`nim`),
  FOREIGN KEY (`divisiID`) REFERENCES divisi(`divisiID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `panitia` (`name`, `nim`, `email`, `password`, `divisiID`, `isverified`) VALUES
('Anonymous', 12345, 'anonymous@gmail.com', 'TIDAKBISADIPAKEKBUATLOGIN', 'D01', 1),
('facio', 11111, 'admin@gmail.com', '$2a$08$qcprXAkouQUbc9mEiFKxoe16d5y7e4gqlN6Ma3ky4X9cos8yXHiHG', 'D01', 1);

-- --------------------------------------------------------

-- penampungan data untuk toggle
-- toggle untuk dipakai sebagai flag akan suatu fitur diaktifkan atau tidak yang nantinya akan dicek pakek if else dalam api
CREATE TABLE `technical_toggle` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `toggle` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- sebagai contoh jika signupMahasiswa = 1, maka mahasiswa dapat melakukan signup, jika 0 maka mahasiswa tidak dapat melakukan signup
INSERT INTO `technical_toggle` (`id`, `name`, `toggle`) VALUES
(1, 'signupMahasiswa', 1),
(2, 'createState', 1),
(3, 'updateState', 1),
(4, 'deleteState', 1),
(5, 'stateRegistration', 1),
(6, 'presensi', 1),
(7, 'HoMEpage', 1),
(8, 'STATEpage', 1), 
(9, 'Malpunpage', 1); 

CREATE TABLE `mahasiswa_password_recovery_token` (
  `nim` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  FOREIGN KEY (`nim`) REFERENCES mahasiswa(`nim`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CREATE TABLE `panitia_password_recovery_token` (
--   `nim` int(11) NOT NULL,
--   `token` varchar(255) NOT NULL,
--   `expires_at` tinyint(1) NOT NULL,
--   FOREIGN KEY (`nim`) REFERENCES panitia(`nim`) ON DELETE CASCADE ON UPDATE CASCADE
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CREATE TABLE `organisator_password_recovery_token` (
--   `nim` int(11) NOT NULL,
--   `token` varchar(255) NOT NULL,
--   `expires_at` tinyint(1) NOT NULL,
--   FOREIGN KEY (`nim`) REFERENCES organisator(`nim`) ON DELETE CASCADE ON UPDATE CASCADE
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `malpun_transaction` (
  `id` VARCHAR(255), -- ORDER ID
  `nim` INT(11),  -- IF EXTERNAL THEN NULL, ELSE MAHASISWA, 
  `status` VARCHAR(255),
  `created_at` datetime DEFAULT NOW(),  
  `updated_at` datetime DEFAULT NOW(),    
  FOREIGN KEY (`nim`) REFERENCES mahasiswa(`nim`) ON DELETE NULL ON UPDATE CASCADE
  PRIMARY KEY (`id`)  

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;