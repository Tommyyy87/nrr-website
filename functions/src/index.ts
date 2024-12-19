import * as functionsV2 from 'firebase-functions/v2'; // Für HTTP-Trigger (v2)
import * as functions from 'firebase-functions/v1'; // Für Auth-Trigger, onCall etc. (v1)
import * as admin from 'firebase-admin';
import * as cors from 'cors';
import { google } from 'googleapis'; // Für den Zugriff auf Google APIs (Drive)

admin.initializeApp();

const corsHandler = cors({
    origin: 'https://notfallschulungenrheinruhr.web.app',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
});

// ********** Auth-Trigger: Admin-Benachrichtigung bei neuer Registrierung **********
export const sendAdminNotification = functions.auth.user().onCreate(async (user: admin.auth.UserRecord) => {
    try {
        const adminUsersSnapshot = await admin.firestore().collection("users")
            .where("isAdmin", "==", true)
            .get();

        const adminEmails: string[] = [];
        adminUsersSnapshot.forEach((doc) => {
            const userData = doc.data();
            if (userData.email) {
                adminEmails.push(userData.email);
            }
        });

        if (adminEmails.length === 0) {
            console.log("Keine Admins gefunden. Keine E-Mails gesendet.");
            return;
        }

        const emailData = {
            to: adminEmails,
            message: {
                subject: "Neuer Benutzer wartet auf Freischaltung",
                text: `Ein neuer Benutzer hat sich registriert:
        
        Name: ${user.displayName || "Unbekannt"}
        Email: ${user.email}
        
        Bitte logge dich ein, um den Benutzer freizuschalten: https://notfallschulungenrheinruhr.web.app/usercontrol.html`,
            },
        };

        await admin.firestore().collection("mail").add(emailData);
        return;
    } catch (error) {
        console.error("Fehler beim Senden der Admin-Benachrichtigung:", error);
        return;
    }
});

// ********** HTTP-Trigger (v2): getUserData **********
export const getUserData = functionsV2.https.onRequest(async (req, res) => {
    corsHandler(req, res, async () => {
        if (req.method === 'OPTIONS') {
            res.status(204).send('');
            return;
        }

        if (req.method !== 'POST') {
            res.status(405).send('Methode nicht erlaubt');
            return;
        }

        try {
            const idToken = req.headers.authorization
                ? req.headers.authorization.split('Bearer ')[1]
                : undefined;

            if (!idToken) {
                res.status(401).send('Nicht autorisiert: Kein Token vorhanden');
                return;
            }

            const decodedToken = await admin.auth().verifyIdToken(idToken);
            const userId = decodedToken.uid;

            const userDoc = await admin.firestore().collection('users').doc(userId).get();

            if (!userDoc.exists) {
                res.status(404).send('Benutzer nicht gefunden');
                return;
            }

            const userData = userDoc.data();
            res.status(200).json(userData);
        } catch (error) {
            if (error instanceof Error) {
                console.error('Fehler beim Abrufen der Benutzerdaten:', error.message);
            } else {
                console.error('Unbekannter Fehler:', error);
            }
            res.status(500).send('Interner Serverfehler');
        }
    });
});

// ********** HTTP-Trigger (v2): addUser **********
export const addUser = functionsV2.https.onRequest(async (req, res) => {
    corsHandler(req, res, async () => {
        if (req.method === 'OPTIONS') {
            res.status(204).send('');
            return;
        }

        if (req.method !== 'POST') {
            res.status(405).send('Methode nicht erlaubt');
            return;
        }

        try {
            const idToken = req.headers.authorization
                ? req.headers.authorization.split('Bearer ')[1]
                : undefined;

            if (!idToken) {
                res.status(401).send('Nicht autorisiert: Kein Token vorhanden');
                return;
            }

            const decodedToken = await admin.auth().verifyIdToken(idToken);

            const { email, firstName, lastName } = req.body;
            const uid = decodedToken.uid;

            await admin.firestore().collection('users').doc(uid).set({
                email,
                firstName,
                lastName,
                approved: false,
                isAdmin: false,
                isMainAdmin: false
            });

            res.status(200).send({ message: 'Benutzer erfolgreich hinzugefügt' });
        } catch (error) {
            if (error instanceof Error) {
                console.error('Fehler beim Hinzufügen des Benutzers:', error.message);
            } else {
                console.error('Unbekannter Fehler:', error);
            }
            res.status(500).send('Interner Serverfehler');
        }
    });
});

// ********** HTTP-Trigger (v2): deleteUser **********
export const deleteUser = functionsV2.https.onRequest(async (req, res) => {
    corsHandler(req, res, async () => {
        if (req.method === 'OPTIONS') {
            res.status(204).send('');
            return;
        }

        if (req.method !== 'POST') {
            res.status(405).send('Methode nicht erlaubt');
            return;
        }

        try {
            const idToken = req.headers.authorization
                ? req.headers.authorization.split('Bearer ')[1]
                : undefined;

            if (!idToken) {
                res.status(401).send('Nicht autorisiert: Kein Token vorhanden');
                return;
            }

            const decodedToken = await admin.auth().verifyIdToken(idToken);

            const userDoc = await admin.firestore().collection('users').doc(decodedToken.uid).get();
            const userData = userDoc.data();

            if (!userData || (!userData.isAdmin && !userData.isMainAdmin)) {
                res.status(403).send('Keine Berechtigung: Admin- oder Main-Admin-Rechte erforderlich');
                return;
            }

            const { uid } = req.body;

            if (!uid) {
                res.status(400).send('Fehlende UID');
                return;
            }

            try {
                await admin.auth().deleteUser(uid);
            } catch (error: any) {
                if (error.code === 'auth/user-not-found') {
                    console.warn('Benutzer in Firebase Auth nicht gefunden, Löschen in Firestore wird fortgesetzt.');
                } else {
                    throw error;
                }
            }

            await admin.firestore().collection('users').doc(uid).delete();

            res.status(200).send('Benutzer wurde erfolgreich gelöscht');
        } catch (error) {
            if (error instanceof Error) {
                console.error('Fehler beim Löschen des Benutzers:', error.message);
            } else {
                console.error('Unbekannter Fehler:', error);
            }
            res.status(500).send('Interner Serverfehler');
        }
    });
});

// ********** Callable Function (v1): uploadToGoogleDrive **********

export const uploadToGoogleDrive = functions.https.onCall(async (data, context) => {
    // Optional: Authentifizierte Benutzer erzwingen
    // if (!context.auth) {
    //   throw new functions.https.HttpsError('unauthenticated', 'Benutzer ist nicht angemeldet.');
    // }

    const clientEmail = functions.config().google.drive_client_email;
    const privateKey = functions.config().google.drive_private_key.replace(/\\n/g, '\n');

    const auth = new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/drive']
    });


    const drive = google.drive({ version: 'v3', auth });

    const folderName = data.folderName;
    const fileName = data.fileName;
    const fileContentBase64 = data.fileContent; // PDF-Datei im Base64-Format

    const folderId = await ensureFolderExists(drive, folderName);
    const media = {
        mimeType: 'application/pdf',
        body: Buffer.from(fileContentBase64, 'base64')
    };

    const file = await drive.files.create({
        requestBody: {
            name: fileName,
            parents: [folderId]
        },
        media: media
    });

    return { message: 'Upload erfolgreich', fileId: file.data.id };
});

async function ensureFolderExists(drive: any, folderName: string): Promise<string> {
    const res = await drive.files.list({
        q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}'`,
        fields: 'files(id, name)'
    });

    if (res.data.files && res.data.files.length > 0) {
        return res.data.files[0].id;
    } else {
        const folder = await drive.files.create({
            requestBody: {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder'
            },
            fields: 'id'
        });
        return folder.data.id;
    }
}
