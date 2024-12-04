const unixTimestamp = Math.floor(Date.now()/ 1000);
console.log(unixTimestamp);
var coinId: Number,fiatCurrency: String;
let graf: Chart;
$('#crypto_search').on('input', function () {
    const q = $(this).val();
    if (typeof q === 'string' && q.length < 2) {
        $('#crypto_list').hide(); 
        return;
    }
    $.ajax({
      url: `https://api.coingecko.com/api/v3/search`,
      method: 'GET',
      data: { query: q }, 
      headers: {
        accept: 'application/json',
        'x-cg-api-key': 'CG-3QeqXHE1sz924ddmmT3d44SH'
      },
      success: function (response) {
        const results = response.coins;
        const datalist = $('#crypto_list');
        datalist.empty();

      
        results.forEach((coin: { id: any; name: any; symbol: any; }) => {
            $('#crypto_list').append(`<li data-id="${coin.id}">${coin.name} (${coin.symbol})</li>`);
        });
        datalist.show();

        $('#crypto_list li').on('click', function() {
            coinId = $(this).data('id');
            const coinName = $(this).text();

            $('#crypto_search').val(coinName); 
            $('#crypto_list').hide(); 
        });

        },
  
        error: function (error) {
            console.error(error);
        }
    });
});
var crypto_price = 0;
function fetchCoinDetails(coinId: any ) {
$.ajax({
    url: `https://api.coingecko.com/api/v3/coins/${coinId}`,
    method: 'GET',
    headers: {
    accept: 'application/json',
    'x-cg-api-key': 'CG-3QeqXHE1sz924ddmmT3d44SH'
    },
    success: function (coinData) {
    crypto_price = coinData.market_data.current_price.usd;
    $('#crypto_data').html(`
        <h2>Detailní informace o kryptoměně</h2>
        <p><strong>Název:</strong> ${coinData.name}</p>
        <p><strong>Symbol:</strong> ${coinData.symbol}</p>
        <p><strong>Aktuální cena (USD):</strong> $${coinData.market_data.current_price.usd}</p>
        <img src="${coinData.image.large}" alt="${coinData.name}">
    `);
    },
    error: function (error) {
    console.error(error);
    }
});
}
function fetchCoinHistory(coinId: any, vsCurrency: any, days: any) {
    $.ajax({
        async: true,
        crossDomain: true,
        url: `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`,
        method: 'GET',
        data: {
            vs_currency: vsCurrency,
            days: days
        },
        headers: {
            accept: 'application/json',
            'x-cg-api-key': 'CG-3QeqXHE1sz924ddmmT3d44SH'
            },
        success: function (data) {
            const prices = data.prices;
            const labels = prices.map((price: (string | number | Date)[]) => new Date(price[0]).toLocaleDateString());
            const values = prices.map((price: any[]) => price[1]);
    
            renderPriceChart(labels, values);
        },
        error: function (error) {
            console.error('Chyba při získávání historických dat:', error);
        }
    });
}
function renderPriceChart(labels: any, values: any) {
    const ctx = (document.getElementById('priceChart') as HTMLCanvasElement).getContext('2d');
    if (!ctx) {
      console.error('Canvas rendering context nebyl nalezen.');
      return;
    }
  
    graf = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Cena v ' + fiatCurrency,
          data: values,
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          fill: false,
          pointBackgroundColor: 'rgba(255, 99, 132, 1)', // Barva bodů
          pointRadius: 1, // Velikost bodů
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: {
                size: 14,
                family: 'Arial, sans-serif', 
                style: 'italic'
              },
              color: '#333' // Barva legendy
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderWidth: 1,
            borderColor: '#ccc',
            bodyFont: {
              size: 12
            }
          }
        },
        scales: {
          x : {
            grid: {
              color: 'rgba(200, 200, 200, 0.2)' // Barva mřížky osy X
            },
            title: {
              display: true,
              text: 'Datum',
              font: {
                size: 16,
                weight: 'bold'
              },
              color: '#666'
            },
            ticks: {
              color: '#333', // Barva popisků osy X
              font: {
                size: 12
              }
            }
          },
          y : {
            grid: {
              color: 'rgba(200, 200, 200, 0.2)' // Barva mřížky osy Y
            },
            title: {
              display: true,
              text: 'Cena (USD)',
              font: {
                size: 16,
                weight: 'bold'
              },
              color: '#666'
            },
            ticks: {
              color: '#333', // Barva popisků osy Y
              font: {
                size: 12
              }
            }
          }
        }
      }
    });
  }
$('#calculate').on('click',function(){
    const cryptoName = $('#crypto_search').val();
    const fiatCurrency = $('#fiat_search').val();

    if (typeof cryptoName !== 'string' || cryptoName.trim() === '') {
        alert("Nezadal jsi žádnou kryptoměnu.");
        return;
    }
    if (typeof fiatCurrency !== 'string' || fiatCurrency.trim() === '') {
        alert("Nezadal jsi žádnou fiat měnu.");
        return;
    }
    if (graf) {
        graf.destroy();
    }
    console.log(`Fetching data for Coin: ${coinId}, Fiat: ${fiatCurrency}`);
    fetchCoinDetails(coinId);
    fetchCoinHistory(coinId, fiatCurrency.trim().toLowerCase(), 30);
})
$(() =>{

    $.ajax({
      url: `https://api.coingecko.com/api/v3/simple/supported_vs_currencies`,
      method: 'GET',
      headers: {
        accept: 'application/json',
        },
      success: function (response) {
        const dataList = $('#fiat_list');
        dataList.empty();
  
        response.forEach((currency: string) => {
            $('#fiat_list').append(`<li data-fiat="${currency}">${currency.toUpperCase()}</li>`);
        });
  
        dataList.show();
  
        $('#fiat_list li').on('click', function () {
            fiatCurrency = $(this).data('fiat');
            $('#fiat_search').val(fiatCurrency.toUpperCase());
            console.log(fiatCurrency);
        });
      },
      error: function (error) {
        console.error('Chyba při získávání fiat měn:', error);
      }
    });
  });









/*$(() => {
    $('#fetch_info').on('click',function () {
        const cryptoName = $('#crypto_search').val();
        console.log(cryptoName);
        if (!cryptoName) {
            alert('Prosím, zadejte jméno kryptoměny.');
            return;
        }
        $.ajax({
            async: true,
            crossDomain: true,
            url: `https://api.coingecko.com/api/v3/search`,
            method: 'GET',
            data:{query: cryptoName},
            headers: {
                accept: 'application/json',
                'x-cg-api-key': 'CG-3QeqXHE1sz924ddmmT3d44SH'
            },
            success: function (searchData) {
                if (searchData.coins.length === 0) {
                  $('#crypto_data').html('<p style="color: red;">Kryptoměna nebyla nalezena.</p>');
                  return;
                }
        
                // První výsledek z vyhledávání
                const coinId = searchData.coins[0].id;
        
                // Druhé volání: Získání detailních informací
                $.ajax({
                  url: `https://api.coingecko.com/api/v3/coins/${coinId}`,
                  method: 'GET',
                  headers: {
                    accept: 'application/json',
                    'x-cg-api-key': 'CG-3QeqXHE1sz924ddmmT3d44SH'
                  },
                  success: function (coinData) {
                    // Zobrazení dat na stránce
                    $('#crypto_data').html(`
                      <h2>Informace o kryptoměně</h2>
                      <p><strong>Název:</strong> ${coinData.name}</p>
                      <p><strong>Symbol:</strong> ${coinData.symbol}</p>
                      <p><strong>Aktuální cena (USD):</strong> $${coinData.market_data.current_price.usd}</p>
                      <img src="${coinData.image.large}" alt="${coinData.name}">
                    `);
                  },
                  error: function (error) {
                    console.error(error);
                    $('#crypto_data').html('<p style="color: red;">Nepodařilo se získat detailní informace o kryptoměně.</p>');
                  },
                });
              },
              error: function (error) {
                console.error(error);
                $('#crypto_data').html('<p style="color: red;">Nepodařilo se provést vyhledávání.</p>');
            },
        });
    });
});
*/