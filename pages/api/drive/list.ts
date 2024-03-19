import {getSession} from "next-auth/react";
import axios from "axios";


export default async function handler(req: any, res: any) {
    const session: any = await getSession({ req });
    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('access', session)

    const accessToken = session?.accessToken;
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };

    const response = await axios.get('https://www.googleapis.com/drive/v3/files', {
        headers
    });


    res.status(200).json(response.data);
}