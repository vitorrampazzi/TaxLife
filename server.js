require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração do Banco de Dados
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

db.connect(err => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  } else {
    console.log('Conectado ao banco de dados MySQL!');
  }
});

// --- ROTA DE CADASTRO DE USUÁRIOS ---
app.post('/api/usuarios', async (req, res) => {
  // ATENÇÃO: Os nomes aqui devem ser EXATAMENTE iguais aos 'name' no HTML
  const { Name, Email, Senha } = req.body;

  if (!Name || !Email || !Senha) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios: Nome, Email, Senha.' });
  }

  try {
    const checkEmailSql = 'SELECT idusers FROM tb_usuarios WHERE Email = ?';
    db.query(checkEmailSql, [Email], async (checkErr, checkResults) => {
      if (checkErr) {
        return res.status(500).json({ erro: 'Erro interno ao verificar email.' });
      }
      if (checkResults.length > 0) {
        return res.status(409).json({ erro: 'Este email já está cadastrado.' });
      }

      const hashedPassword = await bcrypt.hash(Senha, 10);

      const sql = 'INSERT INTO tb_usuarios (Name, Email, Senha) VALUES (?, ?, ?)';
      db.query(sql, [Name, Email, hashedPassword], (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ erro: 'Este email já está cadastrado.' });
          }
          return res.status(500).json({ erro: 'Erro interno ao cadastrar usuário.' });
        } else {
          // Redireciona para index após sucesso
          res.redirect('/index.html');
        }
      });
    });

  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// --- ROTA DE CADASTRO DE TAXISTAS ---
app.post('/api/taxistas', async (req, res) => {
  // ATENÇÃO: Note a mistura de maiúsculas/minúsculas para bater com seu banco
  const { Name, email, password, car_model, car_license_plate } = req.body;

  if (!Name || !email || !password || !car_model || !car_license_plate) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
  }

  try {
    const checkEmailSql = 'SELECT Id_taxistas FROM tb_taxistas WHERE email = ?';
    db.query(checkEmailSql, [email], async (checkErr, checkResults) => {
      if (checkErr) {
        return res.status(500).json({ erro: 'Erro interno ao verificar email.' });
      }
      if (checkResults.length > 0) {
        return res.status(409).json({ erro: 'Este email já está cadastrado como taxista.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const Avaliado = false; // Valor padrão

      const sql = 'INSERT INTO tb_taxistas (Name, email, password, car_model, car_license_plate, Avaliado) VALUES (?, ?, ?, ?, ?, ?)';
      db.query(sql, [Name, email, hashedPassword, car_model, car_license_plate, Avaliado], (err, result) => {
        if (err) {
          console.error('Erro ao cadastrar taxista:', err);
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ erro: 'Email ou Placa já cadastrados.' });
          }
          return res.status(500).json({ erro: 'Erro interno ao cadastrar taxista.' });
        } else {
          res.redirect('/index.html');
        }
      });
    });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

// --- LOGIN USUÁRIO ---
app.post('/api/login-usuario', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ erro: 'Email e senha obrigatórios.' });

  // No banco tb_usuarios, a coluna é 'Email' (maiúsculo)
  const sql = 'SELECT idusers, Name, Email, Senha FROM tb_usuarios WHERE Email = ?';
  
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ erro: 'Erro interno' });
    if (results.length === 0) return res.status(401).json({ erro: 'Email ou senha inválidos' });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.Senha);

    if (isMatch) {
      const { Senha, ...userData } = user;
      res.status(200).json({ mensagem: 'Login sucesso', usuario: userData });
    } else {
      res.status(401).json({ erro: 'Email ou senha inválidos' });
    }
  });
});

// --- LOGIN TAXISTA ---
app.post('/api/login-taxista', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ erro: 'Email e senha obrigatórios.' });

  // No banco tb_taxistas, a coluna é 'email' (minúsculo)
  const sql = 'SELECT Id_taxistas, Name, email, password, car_model, car_license_plate FROM tb_taxistas WHERE email = ?';
  
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ erro: 'Erro interno' });
    if (results.length === 0) return res.status(401).json({ erro: 'Email ou senha inválidos' });

    const driver = results[0];
    const isMatch = await bcrypt.compare(password, driver.password);

    if (isMatch) {
      const { password, ...driverData } = driver;
      res.status(200).json({ mensagem: 'Login sucesso', taxista: driverData });
    } else {
      res.status(401).json({ erro: 'Email ou senha inválidos' });
    }
  });
});

// --- LISTAGENS E DELETES ---
app.get('/api/usuarios', (req, res) => {
  db.query('SELECT idusers, Name, Email FROM tb_usuarios', (err, results) => {
    if (err) res.status(500).json({ erro: 'Erro ao buscar' });
    else res.status(200).json(results);
  });
});

app.get('/api/taxistas', (req, res) => {
  db.query('SELECT Id_taxistas, Name, email, car_model, car_license_plate, Avaliado FROM tb_taxistas', (err, results) => {
    if (err) res.status(500).json({ erro: 'Erro ao buscar' });
    else res.status(200).json(results);
  });
});

app.delete('/api/usuarios/:id', (req, res) => {
  db.query('DELETE FROM tb_usuarios WHERE idusers = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ erro: 'Erro ao excluir' });
    if (result.affectedRows === 0) return res.status(404).json({ erro: 'Não encontrado' });
    res.status(200).json({ mensagem: 'Excluído' });
  });
});

app.delete('/api/taxistas/:id', (req, res) => {
  db.query('DELETE FROM tb_taxistas WHERE Id_taxistas = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ erro: 'Erro ao excluir' });
    if (result.affectedRows === 0) return res.status(404).json({ erro: 'Não encontrado' });
    res.status(200).json({ mensagem: 'Excluído' });
  });
});

// --- ARQUIVOS ESTÁTICOS ---
app.use(express.static('public')); // Certifique-se que seus HTMLs estão na pasta 'public'
app.get('/', (req, res) => res.redirect('/index.html'));
app.get('/index.html', (req, res) => res.sendFile(__dirname + '/public/index.html'));
app.get('/cadastroUsuario.html', (req, res) => res.sendFile(__dirname + '/public/cadastroUsuario.html'));
app.get('/cadastroTaxista.html', (req, res) => res.sendFile(__dirname + '/public/cadastroTaxista.html'));

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});