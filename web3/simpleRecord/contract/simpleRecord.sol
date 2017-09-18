pragma solidity ^ 0.4.10;

contract simpleRecord {
    
    mapping(address=>bool) public isAuthorities;
    mapping(address => patientData) patientMapping;
    
    struct patientData {
        string name;
        string sex;
        int age;
        string birthdate;
        string mednumber;
        string id;
        int record;
        string stat;
        string content;
    }

    function simpleRecord(address[] _authorities) {
        for(var i = 0; i< _authorities.length; i++){
            isAuthorities[_authorities[i]] = true;
        }
        isAuthorities[msg.sender] = true;
    }


    function getName(address patientAddr) constant returns (string) {
        return patientMapping[patientAddr].name;
    }
    function getSex(address patientAddr) constant returns (string) {
        return patientMapping[patientAddr].sex;
    }
    function getAge(address patientAddr) constant returns (int) {
        return patientMapping[patientAddr].age;
    }
    function getBirthdate(address patientAddr) constant returns (string) {
        return patientMapping[patientAddr].birthdate;
    }
    function getMednumber(address patientAddr) constant returns (string) {
        return patientMapping[patientAddr].mednumber;
    }
    function getId(address patientAddr) constant returns (string) {
        return patientMapping[patientAddr].id;
    }
    function getRecord(address patientAddr) constant returns (int) {
        return patientMapping[patientAddr].record;
    }
    function getStatus(address patientAddr) constant returns (string) {
        return patientMapping[patientAddr].stat;
    }
    function getContent(address patientAddr) constant returns (string) {
        return patientMapping[patientAddr].content;
    }




    function newPatientData(address patientAddr, string _name, string _sex, int _age, string _birthdate,
                            string _mednumber, string _id, int _record, string _status, string _content) {
        require(isAuthorities[msg.sender] == true);
        require(patientMapping[patientAddr].age == 0);
        patientMapping[patientAddr].name = _name;
        patientMapping[patientAddr].sex = _sex;
        patientMapping[patientAddr].age = _age;
        patientMapping[patientAddr].birthdate = _birthdate;
        patientMapping[patientAddr].mednumber = _mednumber;
        patientMapping[patientAddr].id = _id;
        patientMapping[patientAddr].record = _record;
        patientMapping[patientAddr].stat = _status;
        patientMapping[patientAddr].content = _content;
    }

    

    function modifyName(address patientAddr, string _name) {
        require(isAuthorities[msg.sender] == true);
        require(patientMapping[patientAddr].age != 0);
        patientMapping[patientAddr].name = _name;
    }
    function modifySex(address patientAddr, string _sex) {
        require(isAuthorities[msg.sender] == true);
        require(patientMapping[patientAddr].age != 0);
        patientMapping[patientAddr].sex = _sex;
    }
    function modifyAge(address patientAddr, int _age) {
        require(isAuthorities[msg.sender] == true);
        require(patientMapping[patientAddr].age != 0);
        patientMapping[patientAddr].age = _age;
    }
    function modifyBirthdate(address patientAddr, string _birthdate) {
        require(isAuthorities[msg.sender] == true);
        require(patientMapping[patientAddr].age != 0);
        patientMapping[patientAddr].birthdate = _birthdate;
    }
    function modifyMednumber(address patientAddr, string _mednumber) {
        require(isAuthorities[msg.sender] == true);
        require(patientMapping[patientAddr].age != 0);
        patientMapping[patientAddr].mednumber = _mednumber;
    }
    function modifyId(address patientAddr, string _id) {
        require(isAuthorities[msg.sender] == true);
        require(patientMapping[patientAddr].age != 0);
        patientMapping[patientAddr].id = _id;
    }
    function modifyRecord(address patientAddr, int _record) {
        require(isAuthorities[msg.sender] == true);
        require(patientMapping[patientAddr].age != 0);
        patientMapping[patientAddr].record = _record;
    }
    function modifyStatus(address patientAddr, string _status) {
        require(isAuthorities[msg.sender] == true);
        require(patientMapping[patientAddr].age != 0);
        patientMapping[patientAddr].stat = _status;
    }
    function modifyContent(address patientAddr, string _content) {
        require(isAuthorities[msg.sender] == true);
        require(patientMapping[patientAddr].age != 0);
        patientMapping[patientAddr].content = _content;
    }
}
