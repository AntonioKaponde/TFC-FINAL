const API_BASE = import.meta.env.VITE_API_URL ?? '';

/** Limpa todos os dados de autenticação e redireciona para o login */
function limparSessaoERedirecionar() {
  localStorage.removeItem('token');
  localStorage.removeItem('userRoles');
  localStorage.removeItem('userName');
  sessionStorage.removeItem('session_active');
  window.location.href = '/';
}

/** Cria um erro estruturado com código HTTP */
function criarErro(mensagem, status) {
  const error = new Error(mensagem);
  error.status = status;
  return error;
}

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    headers,
    ...options,
  });

  if (!response.ok) {
    // Se o token expirou ou é inválido (401) em rotas protegidas,
    // redireciona automaticamente para o login
    if (response.status === 401 && !path.startsWith('/api/auth/')) {
      limparSessaoERedirecionar();
      return; // nunca atinge este ponto, mas previne erro
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const errorBody = await response.json().catch(() => ({}));
      throw criarErro(
        errorBody.mensagem || errorBody.message || errorBody.error || `Erro ${response.status}`,
        response.status
      );
    } else {
      const errorText = await response.text();
      throw criarErro(errorText || `Erro ${response.status}`, response.status);
    }
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

/** Faz um pedido POST com FormData (multipart) — o browser define o Content-Type */
async function requestForm(path, formData) {
  const token = localStorage.getItem('token');
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 401 && !path.startsWith('/api/auth/')) {
      limparSessaoERedirecionar();
      return;
    }
    const text = await response.text().catch(() => '');
    throw criarErro(text || `Erro ${response.status}`, response.status);
  }
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

/** Busca um ficheiro (blob) autenticado, devolvendo { blob, contentType } */
async function getBlob(path) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}${path}`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    if (response.status === 401 && !path.startsWith('/api/auth/')) {
      limparSessaoERedirecionar();
      throw criarErro('Sessão expirada', 401);
    }
    throw criarErro(`Erro ${response.status}`, response.status);
  }
  return {
    blob: await response.blob(),
    contentType: response.headers.get('content-type') || '',
  };
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  postForm: (path, formData) => requestForm(path, formData),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path) => request(path, { method: 'PATCH' }),
  delete: (path) => request(path, { method: 'DELETE' }),
  getBlob,
  download: async (path, filename) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}${path}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      // Redireciona automaticamente se token expirou
      if (response.status === 401 && !path.startsWith('/api/auth/')) {
        limparSessaoERedirecionar();
        return;
      }

      let mensagem = `Erro ao baixar: ${response.status}`;
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const err = await response.json().catch(() => ({}));
          mensagem = err.mensagem || err.message || mensagem;
        } else {
          const text = await response.text();
          if (text) mensagem = text;
        }
      } catch { /* resposta não é JSON */ }
      const error = new Error(mensagem);
      error.status = response.status;
      throw error;
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};
