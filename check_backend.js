import axios from 'axios';

async function check() {
    const url = 'http://127.0.0.1:8000/api/v1/stats';
    console.log(`Checking ${url}...`);

    try {
        const response = await axios.get(url);
        console.log('Success:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
        }
    }
}

check();
