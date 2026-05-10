import axios from 'axios';

async function check() {
    console.log('Connecting to API...');
    try {
        const res = await axios.get('http://localhost:5000/api/sneakers');
        console.log('Response received');
        const sneakers = res.data.sneakers || res.data;
        console.log('API Sneaker Names:');
        sneakers.forEach(s => console.log(`"${s.name}"`));
    } catch (e) {
        console.error('Error:', e.message);
    }
}

check();
