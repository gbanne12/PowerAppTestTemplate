const firstNames: string[] = [
    "Oliver",
    "Harry",
    "Jack",
    "Leo",
    "Malik",
    "Noah",
    "Karim",
    "Muhammad",
    "Henry",
    "Jacob",
    "Alfie",
    "Yara",
    "Joshua",
    "Ali",
    "Isaac",
    "Sophie",
    "Emily",
    "Amelia",
    "Isla",
    "Ava",
    "Ella",
    "Mia",
    "Lily",
    "Grace"
];

const surnames: string[] = [
    "Garcia",
    "Rodriguez",
    "Kumar",
    "Patel",
    "Sharma",
    "Ito",
    "Gomes",
    "Cruz",
    "Nunes",
    "Almeida",
    "Müller",
    "Schmidt",
    "Schneider",
    "Becker",
    "Weber",
    "Hoffmann",
    "Fischer",
    "Richter",
    "Kovacs",
    "Nagy",
    "Horvath"
];


export function getRandomName(name: 'firstname' | 'lastname'): string {
    const array = (name === 'firstname') ? firstNames : surnames;
    return array[Math.floor(Math.random() * array.length)];
}

export function getTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = ('0' + (now.getMonth() + 1)).slice(-2);
    const day = ('0' + now.getDate()).slice(-2);
    const hours = ('0' + now.getHours()).slice(-2);
    const minutes = ('0' + now.getMinutes()).slice(-2);
    const seconds = ('0' + now.getSeconds()).slice(-2);
    return year + month + day + '_' + hours + minutes + seconds;
}

