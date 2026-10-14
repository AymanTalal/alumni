// User factory: builds sample user objects for the "users" table (see migrations/001_create_users.up.sql).
// It only builds plain objects — it never touches the database (scripts/seed.mjs does the inserting).
//
// Values come from the small lists below, picked in order with a counter (no random values),
// so the same seed always produces the same users. Every email contains the user's number,
// so emails are unique.

const FIRST_NAMES = ["Ayşe", "Mehmet", "Elif", "Can", "Zeynep", "Emre", "Selin", "Burak", "Deniz", "Kerem", "Ece", "Mert"];
const LAST_NAMES = ["Yılmaz", "Kaya", "Demir", "Şahin", "Çelik", "Yıldız", "Aydın", "Öztürk", "Arslan", "Doğan", "Koç"];
const DEPARTMENTS = [
  "Management Information Systems",
  "Computer Engineering",
  "Business Administration",
  "Economics",
  "Law",
  "Medicine",
  "Architecture",
];
const EMAIL_DOMAINS = ["ogr.iu.edu.tr", "gmail.com", "outlook.com", "hotmail.com"];
const CITIES = ["Istanbul", "Ankara", "Izmir", "Berlin", "London", "Bursa"];

// Turkish letters → ASCII, for the email address (e.g. "Şahin" → "sahin")
const ASCII = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", Ç: "c", Ğ: "g", İ: "i", Ö: "o", Ş: "s", Ü: "u" };
const toAscii = (text) => text.replace(/[çğıöşüÇĞİÖŞÜ]/g, (letter) => ASCII[letter]).toLowerCase();

// Counts the users built so far; the n-th user always gets the same values
let counter = 0;

// Starts the numbering again from the first user (so a new seed run repeats the same data)
export function resetUserFactory() {
  counter = 0;
}

// Builds one user: { name, email, age, department, extra }. Any field in `overrides` replaces the
// generated value. `extra` is the jsonb column for dynamic fields; every second user gets a city.
export function makeUser(overrides = {}) {
  const n = counter++;
  const first = FIRST_NAMES[n % FIRST_NAMES.length];
  const last = LAST_NAMES[(n * 5) % LAST_NAMES.length]; // steps through the list in a different order
  return {
    name: `${first} ${last}`,
    email: `${toAscii(first)}.${toAscii(last)}${n + 1}@${EMAIL_DOMAINS[n % EMAIL_DOMAINS.length]}`,
    age: 22 + ((n * 7) % 24), // 22–45, satisfies CHECK (age >= 0)
    department: DEPARTMENTS[n % DEPARTMENTS.length],
    extra: n % 2 === 0 ? { city: CITIES[(n / 2) % CITIES.length] } : {},
    ...overrides,
  };
}

// Builds `count` users with makeUser; `overrides` is applied to every one of them.
export function makeUsers(count, overrides = {}) {
  return Array.from({ length: count }, () => makeUser(overrides));
}
