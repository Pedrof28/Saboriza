
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';



// Configura o aplicativo web do Saboriza no Firebase.
// Esses identificadores associam o frontend ao projeto Firebase.
const firebaseConfig = {
  apiKey: "AIzaSyDw0piriofYtXvvSbqf1w7lQDYz5iFb3OY",
  authDomain: "saboriza-delivery.firebaseapp.com",
  projectId: "saboriza-delivery",
  storageBucket: "saboriza-delivery.firebasestorage.app",
  messagingSenderId: "825764787524",
  appId: "1:825764787524:web:410fc326f017851693d311"
};



// Inicializa o Firebase utilizando as configurações do projeto.
const app = initializeApp(firebaseConfig);



// Obtém e exporta o serviço Firebase Authentication.
// Esse serviço é utilizado pelo frontend para autenticar usuários,
// incluindo o login com a conta Google.
export const auth = getAuth(app);
