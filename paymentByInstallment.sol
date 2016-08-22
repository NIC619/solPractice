contract PaymentByInstallment {
    address debtor;
    address constant creditor = 0x1234567890;
    uint public debt;
    uint private lastpaytime;


    function Paymentbyinstallment() {
        debtor = msg.sender;
        debt = msg.value;
        lastpaytime = now;
    }

    function transfer() {
        if (now < lastpaytime + 30 days) throw;

        if (creditor.send(150000)) {
            lastpaytime = now;
            debt -= 150000;
        }
    }

    function getDebtLeft() returns (uint) {
        return debt;
    }
}