/*applicant
openingBank
beneficiary
advisingBank
negotiatingBank
renegotiatingBank
payingBank
reimbursingBank
claimingBank
confirmingBank
transferee
transferringBank */


contract letterOfCredit {
  address public applicant;
  address public beneficiary;
  address public openingBank;
  address public deportCarrier;
  address public negotiatingBank;
  address public customhouse;
  address public importCarrier;

  string public cargoMetadata;
  string public LCStatus;
  string public cargoStatus;
  string public paymentStatus;

  function stringsEqual(string storage _a, string memory _b) internal returns (bool) {
    bytes storage a = bytes(_a);
    bytes memory b = bytes(_b);
    if (a.length != b.length)
      return false;
    for (uint i = 0; i < a.length; i ++)
      if (a[i] != b[i])
        return false;
    return true;
  }

  event cargoChecked(string _cargoMetadata, address _executor, uint _timeChecked, string _cargoStatusReport);
  event paymentChecked(string _cargoMetadata, address _executor, uint _timeChecked);

  function letterOfCredit(address _applicant, address _beneficiary, string metadata, address _deportCarrier, address _customhouse, address _importCarrier, address negotiatingBank) {
    openingBank = msg.sender;
    applicant = _applicant;
    beneficiary = _beneficiary;
    deportCarrier = _deportCarrier;
    customhouse = _customhouse;
    importCarrier = _importCarrier;
    /*
     * 買賣契約內容
     * 受益人領款條件
     * 匯票？
     * 出貨證明？
     * receiving goods
     * after x days
     * etc
     */
    LCStatus = "pendingConfirmation";
    cargoStatus = "N/A";
    cargoMetadata = metadata;    //可改存雜湊值
  }

  function confirmLC() {
    /* 賣方同意信用狀內容，信用狀生效 */
    if (msg.sender == beneficiary)
      LCStatus = "confirmed";
    else throw;
  }

  /* 物品檢查條件(非固定，可變動) */
  /* 由檢查關口執行以下function來確認物品交送條件達成狀況 */
  function deportCarrierCheck(bool ifPassed, string statusReport){
    if(msg.sender == deportCarrier && (stringsEqual(cargoStatus, "N/A") && (stringsEqual(LCStatus, "confirmed"))) ){
      cargoChecked(cargoMetadata, msg.sender, now, statusReport);
      if(ifPassed == true) cargoStatus = "deportCheck";
    }
    else throw;
  }

  function customhouseCheck(bool ifPassed, string statusReport){
    if(msg.sender == customhouse && stringsEqual(cargoStatus, "deportCheck")){
      cargoChecked(cargoMetadata, msg.sender, now, statusReport);
      if(ifPassed == true) LCStatus = "customhouseCheck";
    }
    else throw;
  }

  function importCarrierCheck(bool ifPassed, string statusReport){
    if(msg.sender == importCarrier && stringsEqual(cargoStatus, "customhouseCheck")){
      cargoChecked(cargoMetadata, msg.sender, now, statusReport);
      if(ifPassed == true) LCStatus = "importCheck";
    }
  }
  /* 物品檢查條件 */

  /* 付款 */
  function ngBankPay() {
    if (msg.sender == negotiatingBank &&  stringsEqual(cargoStatus, "importCheck")) {
      if (msg.value >= 1500000000000000000000) {    //1500 unit
        paymentChecked(cargoMetadata, msg.sender, now);
        paymentStatus = "ngBankPaid";
        beneficiary.send(1500000000000000000000);
        paymentChecked(cargoMetadata, beneficiary, now);
      }
    }
  }

  function payingBankPay() {
    if (msg.sender == openingBank &&  (stringsEqual(cargoStatus, "importCheck") && (stringsEqual(paymentStatus, "ngBankPaid"))) ) {
      if (msg.value >= 1500000000000000000000) {    //1500 unit
        paymentChecked(cargoMetadata, msg.sender, now);
        paymentStatus = "payingBankPaid";
        negotiatingBank.send(1500000000000000000000);
        paymentChecked(cargoMetadata, negotiatingBank, now);
      }
    }
  }

  function applicantPay() {
    if (msg.sender == applicant &&  (stringsEqual(cargoStatus, "importCheck") && (stringsEqual(paymentStatus, "payingBankPaid"))) ) {
      if (msg.value >= 1500000000000000000000) {    //1500 unit
        paymentChecked(cargoMetadata, msg.sender, now);
        paymentStatus = "ngBankPaid";
        openingBank.send(1500000000000000000000);
        paymentChecked(cargoMetadata, openingBank, now);
      }
    }
  }
  /* 付款 */

}