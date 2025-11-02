document.addEventListener('DOMContentLoaded', function () {
  const formulario = document.getElementById('formulario-avaliacao');
  const produtoSelect = document.getElementById('produto');
  const vendedorSelect = document.getElementById('vendedor');


  const dados = {
    "Notebook Lenovo Ideapad 3": ["Carlos Souza", "Ana Lima"],
    "Teclado Mecânico RGB": ["João Pedro", "Larissa Rocha"],
    "Cadeira Gamer ThunderX3": ["Roberto Silva", "Juliana Alves"],
    "Fone Bluetooth JBL Tune 510BT": ["Bruna Castro", "Marcelo Tavares"],
    "Monitor LG 24' Full HD": ["Eduardo Nogueira", "Patrícia Mendes"]
  };


  for (const produto in dados) {
    const option = document.createElement('option');
    option.value = produto;
    option.textContent = produto;
    produtoSelect.appendChild(option);
  }


  produtoSelect.addEventListener('change', function () {
    vendedorSelect.innerHTML = '<option value="" disabled selected>Selecione um vendedor</option>';
    const vendedores = dados[this.value] || [];
    vendedores.forEach(function (vendedor) {
      const option = document.createElement('option');
      option.value = vendedor;
      option.textContent = vendedor;
      vendedorSelect.appendChild(option);
    });
  });

  
  formulario.addEventListener('submit', function (evento) {
    evento.preventDefault();

    const produto = produtoSelect.value;
    const vendedor = vendedorSelect.value;
    const nota = document.getElementById('nota').value;
    const comentario = document.getElementById('comentario').value;

    const avaliacao = {
      produto,
      vendedor,
      nota,
      comentario,
      data: new Date().toLocaleString()
    };

    
    let avaliacoes = JSON.parse(localStorage.getItem('avaliacoes')) || [];
    avaliacoes.push(avaliacao);
    localStorage.setItem('avaliacoes', JSON.stringify(avaliacoes));

    console.log("Avaliações salvas:");
    console.table(avaliacoes);

    
    document.getElementById('mensagem-sucesso').classList.remove('d-none');
    setTimeout(() => {
      document.getElementById('mensagem-sucesso').classList.add('d-none');
    }, 3000);

    formulario.reset();
    vendedorSelect.innerHTML = '<option value="" disabled selected>Selecione um vendedor</option>';
  });
});
