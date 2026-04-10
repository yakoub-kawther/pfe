/*CREATE DATABASE db;*/
/*use db ;*/
/*CREATE TABLE person (
    id              INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    first_name       VARCHAR(50)    NOT NULL,
    last_name       VARCHAR(50)    NOT NULL,
    gender          VARCHAR(6)      CHECK (gender IN ('male', 'female')) NOT NULL,
    phone           VARCHAR(20)      NULL UNIQUE,
    email           VARCHAR(100)    UNIQUE,
    address         VARCHAR(255)
);*/

/*CREATE TABLE student (
    person_id       INT PRIMARY KEY REFERENCES person(id) ON DELETE CASCADE ,
    date_of_birth   DATE NOT NULL , 
    pecial_case VARCHAR(255) NULL
);*/


/*CREATE TABLE parent (
    person_id       INT PRIMARY KEY REFERENCES person(id) ON DELETE CASCADE,
    relationship    VARCHAR(10)     CHECK (relationship IN ('father', 'mother', 'guardian' ,'other')) NOT NULL
);*/

/*CREATE TABLE position (
    id      INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name    VARCHAR(50) NOT NULL UNIQUE
);*/


/*CREATE TABLE employee (
    person_id INT UNSIGNED NOT NULL,
    hire_date DATE NOT NULL,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    position_id INT UNSIGNED NULL,
    PRIMARY KEY (person_id),
    FOREIGN KEY (person_id) REFERENCES person(id) ON DELETE CASCADE,
    FOREIGN KEY (position_id) REFERENCES position (id) ON DELETE SET NULL
);*/


/*CREATE TABLE parent_student (
    parent_id       INT NOT NULL REFERENCES parent(person_id) ON DELETE CASCADE,
    student_id      INT NOT NULL REFERENCES student(person_id) ON DELETE CASCADE,
    PRIMARY KEY (parent_id, student_id)
);*/


/*CREATE TABLE language (
    id              SERIAL PRIMARY KEY,
    language_name   VARCHAR(50)     NOT NULL UNIQUE,
    shortcut     varchar(10)
);*/
/*
CREATE TABLE teacher (
    employee_id     INT PRIMARY KEY REFERENCES employee(person_id) ON DELETE CASCADE,
    qualifications  TEXT,
    language_id     INT             REFERENCES language(id) ON DELETE SET NULL
    is_head_teacher BOOLEAN DEFAULT FALSE
    
);*/

/*
CREATE TABLE account (
    id              INT NOT NULL UNIQUE PRIMARY KEY,
    role            INT         NOT NULL REFERENCES role(id),
    password_hash   VARCHAR(255)    NOT NULL,
    status          VARCHAR(10)     CHECK (status IN ('active', 'inactive')) NOT NULL DEFAULT 'active',
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    
 
    
    student_id      INT             UNIQUE REFERENCES student(person_id) ON DELETE CASCADE,
    
    employee_id     INT             UNIQUE REFERENCES employee(person_id) ON DELETE CASCADE);
    
*/


/*CREATE TABLE role (
id int auto_increment primary key , 
name varchar(50));*/
    

/*ADD CONSTRAINT one_person_only
CHECK (
    (student_id IS NOT NULL AND employee_id IS NULL)
    OR
    (student_id IS NULL AND employee_id IS NOT NULL)*/


/*CREATE TABLE level (
    id          SERIAL PRIMARY KEY,
    level_name  VARCHAR(10) NOT NULL UNIQUE
);*/



/*CREATE TABLE classroom (
    id              INT UNSIGNED auto_increment PRIMARY KEY,
    name            VARCHAR(20)     NOT NULL UNIQUE,
    capacity        INT             NOT NULL
);*/



/*CREATE TABLE class (
    id           INT UNSIGNED auto_increment PRIMARY KEY,
    name         VARCHAR(50)  NOT NULL,
    language_id  INT          NOT NULL REFERENCES language(id),
    level_id     INT          NOT NULL REFERENCES level(id),
    teacher_id   INT          NOT NULL REFERENCES teacher(employee_id),
    start_date   DATE         NOT NULL,
    status       VARCHAR(10)  CHECK (status IN ('active','completed',
                 'cancelled')) NOT NULL DEFAULT 'active',
    UNIQUE (name, start_date)
);*/





/*CREATE TABLE schedule (
    id           SERIAL PRIMARY KEY,
    class_id     INT         NOT NULL REFERENCES class(id) ON DELETE CASCADE,
    classroom_id INT         NOT NULL REFERENCES classroom(id),
    day_of_week  VARCHAR(20) NOT NULL,
    start_time   TIME        NOT NULL,
    end_time     TIME        NOT NULL
);*/



/*CREATE TABLE session (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    schedule_id BIGINT UNSIGNED NOT NULL,
    session_date datetime NOT NULL DEFAULT current_timestamp,
    status VARCHAR(20),
    FOREIGN KEY (schedule_id) REFERENCES schedule(id) ON DELETE CASCADE
);*/


/*CREATE TABLE inscription (
    id                  SERIAL PRIMARY KEY,
    student_id          INT             NOT NULL REFERENCES student(person_id) ON DELETE CASCADE,
    class_id            INT             NOT NULL REFERENCES class(id) ON DELETE CASCADE,
    inscription_date    DATETIME            NOT NULL DEFAULT current_timestamp,
    UNIQUE (student_id, class_id)
);*/


/*CREATE TABLE attendance (
    id          SERIAL PRIMARY KEY,
    session_id  INT        NOT NULL REFERENCES session(id) ON DELETE CASCADE,
    student_id  INT        NOT NULL REFERENCES student(person_id) ON DELETE CASCADE,
    status      VARCHAR(10) CHECK (status IN ('present', 'absent')) NOT NULL,
    UNIQUE (session_id, student_id)
);*/


/*CREATE TABLE test (
    id              SERIAL PRIMARY KEY,
    class_id        INT             REFERENCES class(id) ON DELETE SET NULL, -- NULL = placement test
    component       VARCHAR(10)     CHECK (component IN ('oral', 'written')) NOT NULL,
    date            DATE            NOT NULL,
    file_path   VARCHAR(255) NULL,
    created_by      INT             NOT NULL REFERENCES account(id),
    approved_by     INT             REFERENCES account(id),
    status          VARCHAR(10)     CHECK (status IN ('pending', 'approved', 'rejected')) NOT NULL DEFAULT 'pending'
);*/



/*CREATE TABLE note (
    id              SERIAL PRIMARY KEY,
    test_id         INT             NOT NULL REFERENCES test(id) ON DELETE CASCADE,
    student_id      INT             NOT NULL REFERENCES student(person_id) ON DELETE CASCADE,
    mark            FLOAT           NOT NULL CHECK (mark >= 0 AND mark <= 100),
    is_passed       BOOLEAN         NOT NULL DEFAULT FALSE,
    UNIQUE (test_id, student_id)
);*/



/*CREATE TABLE payment (
    id              SERIAL PRIMARY KEY,
    inscription_id  INT             NOT NULL UNIQUE REFERENCES inscription(id) ON DELETE CASCADE,
    amount          DECIMAL(10,2)   NOT NULL,
    payment_date    datetime        NULL DEFAULT current_timestamp,
    status          VARCHAR(10)     CHECK (status IN ('paid', 'pending', 'overdue')) NOT NULL DEFAULT 'pending'
);*/


/*CREATE TABLE salary (
    id              SERIAL PRIMARY KEY,
    employee_id     INT             NOT NULL REFERENCES employee(person_id) ON DELETE CASCADE,
    amount          DECIMAL(10,2)   NOT NULL,
    payment_date    DATE            NOT NULL,
    status          VARCHAR(10)     CHECK (status IN ('paid', 'pending')) NOT NULL DEFAULT 'pending'
);*/




/*CREATE TABLE notification (
    id          SERIAL PRIMARY KEY,
    sender_id   INT             NOT NULL REFERENCES account(id) ON DELETE CASCADE,
    type        VARCHAR(25)     CHECK (type IN (
                    'schedule_change', 'payment_reminder',
                    'absence_alert', 
                    'meeting', 'salary', 'general'
                )) NOT NULL,
    title       VARCHAR(150)    NOT NULL,
    body        TEXT            NOT NULL,
    sent_at     TIMESTAMP       NOT NULL DEFAULT NOW()
);*/


/*CREATE TABLE notification_receiver (
    id                  SERIAL PRIMARY KEY,
    notification_id     INT             NOT NULL REFERENCES notification(id) ON DELETE CASCADE,
    receiver_id         INT             NOT NULL REFERENCES account(id) ON DELETE CASCADE,
    UNIQUE (notification_id, receiver_id)
);*/



/*CREATE INDEX idx_student_person      ON student(person_id);
CREATE INDEX idx_parent_person       ON parent(person_id);
CREATE INDEX idx_employee_person     ON employee(person_id);
CREATE INDEX idx_teacher_employee    ON teacher(employee_id);
CREATE INDEX idx_class_level         ON class(level_id);
CREATE INDEX idx_class_teacher       ON class(teacher_id);
CREATE INDEX idx_class_status        ON class(status);
CREATE INDEX idx_session_date        ON session(session_date);
CREATE INDEX idx_session_class       ON session(schedule_id);
CREATE INDEX idx_attendance_student  ON attendance(student_id);
CREATE INDEX idx_attendance_session  ON attendance(session_id);
CREATE INDEX idx_inscription_student ON inscription(student_id);
CREATE INDEX idx_inscription_class   ON inscription(class_id);
CREATE INDEX idx_payment_status      ON payment(status);
CREATE INDEX idx_notification_sender ON notification(sender_id);
CREATE INDEX idx_notif_receiver      ON notification_receiver(receiver_id);
CREATE INDEX idx_test_class          ON test(class_id);
CREATE INDEX idx_note_student        ON note(student_id);
CREATE INDEX idx_salary_employee     ON salary(employee_id);*/

/* modifications after 25-3-2026 meeting*/













