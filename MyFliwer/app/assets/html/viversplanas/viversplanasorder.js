// This function takes an 'order' object and returns a populated HTML string
export const getOrderHtml = (order) => {
    // Use backticks ` to create a multi-line string
    // Use ${...} to inject your data safely

    var htmlOrig=`
    <!DOCTYPE html>
    <html>
        <head>
            <style>
                body{
                    width: /*42cm*/21cm;
                    height: /*59.4cm*/27.2cm;
                    /*margin: 30mm 45mm 30mm 45mm; */
                    font-family: arial;
                    /* change the margins as you want them to be. */
                } 

                h1 {
                    font-size: 18px;
                }

                .all{
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }

                .header{
                    width:100%;
                    display:flex;
                    flex-direction: row;
                    gap:25px;
                    padding-top:10px;
                }        

                .middle-section{
                    width:100%;
                    flex-grow:1;
                }

                .iconContainer{

                }

                .icon{
                    width: 150px; 
                    height: 150px;
                }

                .info{
                    margin-right:50px;
                }

                .info:not(h1){
                    font-size: 14px;
                }

                .type{
                    width: auto;
                    flex-grow: 1;
                    height: 180;
                    border-radius: 10px;
                    border-width: 2px;
                    border-color: black;
                    border-style: solid;
                    display: flex;
                    flex-direction: column;
                    padding:10px;
                }

                .exchange{
                    width: 50%;
                    border-radius: 10px;
                    border-width: 2px;
                    border-color: black;
                    border-style: solid;
                    display: flex;
                    flex-direction: column;
                    padding:10px;
                    gap:10px;
                    padding-top:20px;
                    padding-bottom:20px;
                    margin-top:20px;
                }

                .exchange div{
                    display: flex;
                    flex-direction: row;
                }

                .exchange-title{
                    font-weight: bold;
                    margin-right:20px;
                }

                .comptat{
                    width: 100%;
                    flex-grow: 1;
                }

                .where{
                    width: 100%;
                    display: flex;
                    flex-direction: row;
                }

                .city{
                    flex:1;
                }

                .country{
                    flex:1;
                }

            
                table {
                    margin-top:20px;
                    width: 100%;
                    border-collapse: collapse;
                    border-width: 1px;
                    border-color: black;
                    border-style: solid;
                    font-size: 12px;
                    font-family: Helvetica, Arial, sans-serif;
                    color: black;
                    background-color: rgb(160, 160, 160);
                }
                th, td {
                    border: none;
                    padding: 8px;
                }
                th {
                    font-weight: bold;
                }
                td {
                    text-align: center;
                }
                
                tbody td {
                    background-color: white;
                }

                .products-table {
                    text-align: left;
                }
                .products-table td {
                    text-align: left;
                }

                .description-title {
                    width: 40%;
                }

                .description {
                    width: 40%;
                    background-color: white;
                }
                .products-table td:not(.description, .description-title,.code,.code-title),.products-table  th:not(.description, .description-title,.code,.code-title) {
                    text-align: right;
                }

                .totals-table td{
                    text-align: right;
                }

                .total{
                    font-weight: bold;
                    font-size: 20px;
                }

                .total-title{
                    text-align: right;
                }

                .lopd{
                    margin-top: 20px;
                    font-size: 13px;
                    padding:20
                }

            </style>
        </head>
        <body>
            <div class="all">
                <div class="header">
                    <div class="iconContainer"><img src="data:image/jpeg;base64,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" class="icon" /></div>
                    <div class="info">
                        <h1>VIVERS PLANAS EXPORT SL</h1>
                        MASOS DE PUBOL NUM. 11<br>
                        17120 PERA, LA<br>
                        GIRONA<br><br>
                        TELEF.: 972488213<br><br>
                        CIF: B10787273<br><br>
                        pubol@viversplanas.com
                    </div>
                    <div class="type">
                        <div class="comptat">COMPTAT</div>
                        <div class="where">
                            <div class="city">GIRONA</div>
                            <div class="country">España</div>
                        </div>
                    </div>
                </div>

                <!-- Use tables to make a table for DATE BUDGET CLIENT VAT NUMBER PHONE PAGE-->
                <table>
                    <thead>
                        <tr>
                            <th>DATE</th>
                            <th>BUDGET</th>
                            <th>CLIENT</th>
                            <th>VAT NUMBER</th>
                            <th>PHONE</th>
                            <th >PAGE</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{$DATE}</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td class="page">{$PAGE}</td>
                        </tr>
                    </tbody>
                </table>

                <!-- Use tables to make a table for DESCRIPTION UNITS PRICE AMOUNT (description has 65% width)-->
                <div class="middle-section">
                    <table class="products-table">
                        <thead>
                            <tr>
                                <th class="code-title">CODE</th>
                                <th class="description-title">DESCRIPTION</th>
                                <th>UNITS</th>
                                <th>PRICE</th>
                                <th>AMOUNT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {$PAGEPRODUCTS}
                            <tr>
                                <td class="description">-</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td class="description">Transporte no incluido</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                
                <div class="footer-section">

                    <table  class="totals-table">
                        <thead>
                            <tr>
                                <!--
                                <th>TOTAL AM.</th>
                                <th>%</th>
                                <th>AMOUNT</th>
                                <th>BASE</th>
                                <th>%</th>
                                <th>TAX</th>
                                <th>REC.</th>
                                <th>TOTAL (Eur)</th>
                                -->
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th class="total-title">TOTAL (Eur)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td class="total">{$TOTAL}€</td>
                            </tr>
                        </tbody>
                    </table>


                    <div class="exchange">
                        <div>
                            <div class="exchange-title">Part exchange : </div>
                            <div>0,00</div>
                        </div>
                        <div>
                            <div class="exchange-title">Method of payment : </div>
                            <div>A la vista</div>
                        </div>
                    </div>

                    <div class="lopd">
                        INFORMATION LOPD.- The responsible of your data is Vivers Planas Export, S.L, with CIF B10787273 domiciled in Masos de Pubol, 11, La Pera, CP 17120. The data will be processed to provide and manage the services described in this quotation. We will keep your data for the duration of our commercial relationship, respecting the established legal deadlines. We may communicate your data to subcontracted third parties for the provision of administrative, IT, hosting, accounting or tax services, with whom we have signed confidentiality contracts. You agree to the processing and communication of your data by accepting this quotation. You can exercise your rights by sending an email to jordicosta@viversplanas.com, with a copy of your ID card. Get more information visiting our website www.viversplanas.com.
                    </div>

                </div>
            </div>
        </body>
        </html>
    `;

    var MAXPRODUCTSPAGE=11;
    var page=1;

    var addPage = (page) => {

        var newHtML=htmlOrig;
            
        //replace order.totalPrice (in format two decimals)
        newHtML = newHtML.replace("{$TOTAL}", order.totalPrice.toFixed(2));
        newHtML = newHtML.replace("{$PAGE}",page);

        //save in var date a string with today's date in dd/mm/yyyy format
        var date = new Date();
        var day = date.getDate();
        var month = date.getMonth() + 1;
        var year = date.getFullYear();
        var date = day + '/' + month + '/' + year;
        newHtML = newHtML.replace("{$DATE}",date);

        return newHtML;

    }

    var html=addPage(page);

    

    //calculate Lines

    const getPriceByType = (item, priceType = 'price') => {
    if (priceType === 'price') return parseFloat(item.price || 0);

    const fieldId = parseInt(priceType.replace('cf_', ''), 10);
    const field = item.customFields?.find(f => f.id === fieldId);
    if (!field?.value) return 0;

    return parseFloat(field.value.replace('€', '').replace(',', '.') || 0);
    };

    var calcPrice = (p)=>{
        var price = getPriceByType(p, p.priceType || 'price');
        if(p.discount){
            price = Math.round((p.discount<0?(price * (1 - (-1*p.discount) / 100)):(price * (1 + p.discount / 100))) * 100) / 100;
        }
        return price;
    }

    var products="";
    var pageProducts=0;
    for(var i=0;i<order.products.length;i++){
        
        if(pageProducts>=MAXPRODUCTSPAGE){
            
            html = html.replace("{$PAGEPRODUCTS}", products);
            page++;
            html+=addPage(page);
            pageProducts=0;
            products="";
        }



        var item = order.products[i];
        var price = calcPrice(item);
        var totalProduct=price*item.quantity;
        products+=`
            <tr>
                <td class="code">`+(item.customFields.length>9 && item.customFields[10]?item.customFields[10].value:"")+`</td>
                <td class="description">`+item.name+`/250</td>
                <td>`+item.quantity+`</td>
                <td>`+price.toFixed(2)+`</td>
                <td>`+totalProduct.toFixed(2)+`</td>
            </tr>
        `
        pageProducts++;
    }

    html = html.replace("{$PAGEPRODUCTS}", products);

    return html;
};