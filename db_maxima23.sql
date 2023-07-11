-- DATABASE versi 9 JULI 2023
-- UPDATE:
-- 1. Data dummy untuk testing di state_registration, state_activities
-- 2. Penambahan data technical_toggle untuk toggle-toggle yang akan digunakan dalam API
-- 3. Penambahan data mahasiswa, panitia, organisator (passwordnya semua sama: 12345678)
-- 4. Penambahan properti di state_activities (stateDesc, location)
-- 5. farrel dah tambahin properti di mahasiswa (token)
--
-- NOTE: 
--      jika lu pada ada yng nemu error saat import db/updet db/testing, janlup inpokan digrup ae.
--      dan jika ad yg dirasa ganjal ato salah atopun mau kasih sarang, ingpokan aja digrup.

--  nampung data divisi untuk setiap panitia yang register
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
  PRIMARY KEY (`nim`) 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `mahasiswa` (`name`, `nim`, `password`, `whatsapp`, `email`, `angkatan`, `idLine`, `prodi`, `token`) VALUES
('Dummy', 88484, 'TdkBisaDipakekBuatLogin', '080809090707', 'tes@student.umn.ac.id', 2023,'dummylineid', 'Informatika', 'MXM23-88484'),
('henry', 66484, '$2a$10$7XBGYMXUE6vsYUv/ohsgr.QrKR1efpEyQ9BnEhJBrrzjg.iorAgIy', '0852', 'gilbert.henry@student.umn.ac.id', 2023,'lineidgilbert', 'Infor', 'MXM23-66484');

-- --------------------------------------------------------

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

INSERT INTO `state_activities` (`stateID`, `name`, `day`, `stateLogo`,`stateDesc`, `location`, `quota`, `registered`) VALUES
(1, 'Ultima Sonora', 'D1', 'logo link','deskripsi lorem','di umn', 80, 77),
(2, 'Lions Basket', 'D1', 'logo link','deskripsi lorem','di umn', 50, 49),
(3, 'UESC Scrabble', 'D1', 'logo link','deskripsi lorem','di umn', 30, 29),
(4, 'UESC Spelling bee', 'D1', 'logo link','deskripsi lorem','di umn', 30, 28),
(5, 'UESC Speech', 'D1', 'logo link','deskripsi lorem','di umn', 30, 29),
(6, 'Lions Volleyball ', 'D1', 'logo link' ,'deskripsi lorem','di umn', 25, 25),
(7, 'Tracce Reguler', 'D1', 'logo link','deskripsi lorem','di umn', 20, 19),
(8, 'UMN Radio', 'D6', 'logo link','deskripsi lorem','di umn', 200, 197),
(9, 'Game Development Club (GDC)', 'D6', 'logo link','deskripsi lorem','di umn', 30, 29),
(10, 'RADAR UMN', 'D6', 'logo link','deskripsi lorem','di umn', 30, 28),
(11, 'Ikatan Bikers UMN (IBU)', 'D7', 'logo link' ,'deskripsi lorem','di umn', 30, 30);
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
(6, 'presensi', 1); 
