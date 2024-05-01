class Colours {
    static RESET = '\x1b[0m';
    static RED = '\x1b[31m';
    static GREEN = '\x1b[92m';
    static YELLOW = '\x1b[93m';
    static PINK = '\x1b[95m';
    static CYAN = '\x1b[36m';
}

class Endpoint {
    static TOKEN = '/users/tokens';
    static POT = '/contest_winnings';
    static BALANCE = '/users/balances';
}

module.exports = {
    Colours,
    Endpoint
};