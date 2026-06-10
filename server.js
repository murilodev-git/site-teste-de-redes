require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// LOGIN
app.post('/login', async (req, res) => {

    const { usuario, senha } = req.body;

    const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('usuario', usuario)
        .eq('senha', senha);

    if (error) {
        return res.status(500).json(error);
    }

    if (data.length > 0) {

        await supabase
            .from('logs_login')
            .insert({
                usuario,
                sucesso: true
            });

        return res.json({
            sucesso: true,
            admin: usuario === 'admin'
        });
    }

    await supabase
        .from('logs_login')
        .insert({
            usuario,
            sucesso: false
        });

    return res.json({
        sucesso: false
    });
});

// PRODUTOS
app.get('/produtos', async (req, res) => {

    const { data, error } = await supabase
        .from('produtos')
        .select('*');

    if (error) {
        return res.status(500).json(error);
    }

    res.json(data);
});

// LOGS
app.get('/logs', async (req, res) => {

    const { data, error } = await supabase
        .from('logs_login')
        .select('*')
        .order('data_hora', {
            ascending: false
        });

    if (error) {
        return res.status(500).json(error);
    }

    res.json(data);
});
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});
app.listen(process.env.PORT || 3000, () => {
    console.log('Servidor rodando na porta 3000');
});