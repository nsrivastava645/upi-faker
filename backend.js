const Http = new XMLHttpRequest();
const url = 'https://dev.onebanc.ai/assignment.asmx/GetTransactionHistory';
const params = {
    "userId": 1,
    "recipientId": 2
}
Http.open("GET", url + formatParams(params));
Http.send();

Http.onload = (e) => {
    let response = Http.responseText;
    let transactionsPerDate = returnFormattedTransactions(response);
    console.log(transactionsPerDate);
    mountOnDom(transactionsPerDate);
}
function formatParams(params) {
    return "?" + Object
        .keys(params)
        .map(function (key) {
            return key + "=" + encodeURIComponent(params[key])
        })
        .join("&")
}
function getDateTime(isoString, withTime = false) {
    let date = new Date(isoString);
    let year = date.getFullYear();
    let month = new Intl.DateTimeFormat('en-US', { month: "short" }).format;
    let monthName = month(date);
    let time = new Intl.DateTimeFormat('en-US', { timeStyle: "short" }).format;
    let timeStr = time(date);
    let day = date.getDate();
    if (!withTime) {
        return `${day} ${monthName} ${year}`;
    } else {
        return `${day} ${monthName} ${year}. ${timeStr}`;
    }
}
function returnFormattedTransactions(response) {
    response = JSON.parse(response);
    console.log(response);
    let mappedResponse = { userId: response.userId };
    response.transactions.forEach((transaction) => {
        if (getDateTime(transaction.startDate, false) in mappedResponse) {
            mappedResponse[getDateTime(transaction.startDate, false)].push(transaction);
        } else {
            mappedResponse[getDateTime(transaction.startDate, false)] = [transaction];
        }
    });
    return mappedResponse;
}
function getFlagText(direction, type) {
    if (direction === 1 && type === 1) {//Sent Money
        return 'You Sent';
    } else if (direction === 1 && type === 2) { //Sent Collect Request
        return 'You Requested';
    } else if (direction === 2 && type === 1) { //Rceived Money
        return 'You Received';
    } else if (direction === 2 && type === 2) {//Received request to pay
        return 'Request Received';
    }
}
function mountOnDom(transactions) {
    let navBar = document.createElement('nav');
    navBar.innerHTML = `<i class="fas fa-long-arrow-alt-left"><span> VPA ID : ${transactions.userId} </span> </i>`;
    navBar.classList.add('navbar', 'navbar-light');
    document.body.appendChild(navBar);
    let dates = Object.keys(transactions);
    dates.forEach((date) => {
        if (date != 'userId') {
            let mainContainer = document.createElement('div');
            mainContainer.classList.add('per-day');
            let dateHeader = document.createElement('h2');
            dateHeader.innerText = date;
            dateHeader.classList.add('date-heading');
            document.body.appendChild(dateHeader);
            let txnContainerContainer = document.createElement('div');
            txnContainerContainer.classList.add('transactions-container');
            transactions[date].forEach((transactionPerDate) => {
                let txnContainer = document.createElement('div');
                txnContainer.classList.add('transactions');
                let amountContainer = document.createElement('p');
                amountContainer.classList.add('amount');
                amountContainer.innerText = `₹ ${transactionPerDate['amount']}`;
                let flagContainer = document.createElement('p');
                flagContainer.classList.add('flag');
                let flagText = getFlagText(transactionPerDate.direction, transactionPerDate.type);
                flagContainer.innerHTML = `<i class="far fa-check-circle"></i> ${flagText}`;
                let actionButtonsContainer = document.createElement('div');
                actionButtonsContainer.classList.add('action-btn-container');
                let txnIdContainer = document.createElement('p');
                txnIdContainer.classList.add('txn-id');
                let cancelBtn = document.createElement('button');
                cancelBtn.classList.add("btn", "btn-danger");
                cancelBtn.innerText = 'Cancel';
                let payBtn = document.createElement('button');
                payBtn.classList.add("btn", "btn-primary");
                payBtn.innerText = 'Pay';
                let declineBtn = document.createElement('button');
                declineBtn.classList.add("btn", "btn-secondary");
                declineBtn.innerText = 'Decline';
                if (flagText === 'You Requested') {
                    txnContainer.classList.add('sent');
                    actionButtonsContainer.appendChild(cancelBtn);
                } else if (flagText === 'Request Received') {
                    txnContainer.classList.add('received');
                    actionButtonsContainer.appendChild(payBtn);
                    actionButtonsContainer.appendChild(declineBtn);
                } else if (flagText === 'You Sent') {
                    txnContainer.classList.add('sent');
                    txnIdContainer.innerHTML = `Transaction ID :<br> ${transactionPerDate.transcationId || Math.floor(Math.random() * 10000000000000)}`;
                } else if (flagText === 'You Received') {
                    txnContainer.classList.add('received');
                    txnIdContainer.innerHTML = `Transaction ID :<br> ${transactionPerDate.transcationId || Math.floor(Math.random() * 10000000000000)}`;
                }
                let expiryTimeContainer = document.createElement('div');
                expiryTimeContainer.innerText = `Expires on: ${getDateTime(transactionPerDate.endDate, true)}`;
                expiryTimeContainer.classList.add('expires-on');
                let moreDetailsBtn = document.createElement('div');
                moreDetailsBtn.innerHTML = `<i class="fas fa-angle-right"></i>`;
                moreDetailsBtn.classList.add('more-details');
                txnContainer.appendChild(amountContainer);
                txnContainer.appendChild(flagContainer);
                txnContainer.appendChild(actionButtonsContainer);
                txnContainer.appendChild(txnIdContainer);
                txnContainer.appendChild(expiryTimeContainer);
                txnContainer.appendChild(moreDetailsBtn);
                txnContainerContainer.appendChild(txnContainer);
                mainContainer.appendChild(dateHeader);
                mainContainer.appendChild(txnContainerContainer);
                document.body.appendChild(mainContainer);
            });
        }
    });
    document.querySelectorAll('.btn').forEach(btn=>{
        btn.addEventListener("click",()=>{
            window.alert('Expose the corresponding apis to make it work.!!!!!');
        });
    });
}