function validate_input(params){
    const onlyLettersPattern = /^[A-Za-z0-9 _]*[A-Za-z0-9][A-Za-z0-9 _]*$/;
    if(!params.match(onlyLettersPattern))
        return false;
    return true;
}
module.exports = validate_input;