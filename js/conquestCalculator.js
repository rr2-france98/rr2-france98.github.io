/*
* SOURCES
*
* https://forums.flaregames.com/t/how-to-achieve-supreme-victory-in-conquest/16641/2
* https://royal-revolt-2.fandom.com/wiki/Conquest_-_Supreme_Victory
*
*/
class Calculator {
	constructor() {
		// Show console info message
		console.log('%c Look at "calc" variable to play with this script ', 'background: red; color: #222; font-size: 32px;');

		// Save DOM render output
		[
			'skull_team',
			'skull_opponent',
			'power_team',
			'power_opponent',
			'attackdef_team',
			'attackdef_opponent'
		].forEach(k => {
			this[k] = document.getElementById(k);
		});

		// Set default numeric value
		[
			'skull_win_team',
			'skull_win_opponent',
			'nb_player_team',
			'nb_player_opponent',
			'nb_troop_team',
			'nb_troop_opponent',
			'attack_team_hero',
			'attack_opponent_hero',
			'def_team_hero',
			'def_opponent_hero',
			'team_tower',
			'opponent_tower'
		].forEach(k => {
			this[k] = 0;
		});

		[
			'attack_team_troop',
			'attack_opponent_troop',
			'def_team_troop',
			'def_opponent_troop',
			'team_power',
			'opponent_power'
		].forEach(k => {
			this[k] = 1;
		});

		// Set others default
		this.time_hour = 23;
		this.time_minute = 0;
		this.attacker = "team";
		this.tower_level = 1;
		this.ground = "0.7;1.3";

		// CONST
		this.const_timeRemainingData = [24, 10];
		this.const_timeModifierData = [8, 1];

		this.const_basedHeroesValue = 2250;
		this.const_basedAttackHeroesValue = 75;

		// Set values based on hash
		const that = this;
		document.location.hash.split('&').forEach(hash => {
			const hashSplited = hash.split('=');
			if(hashSplited.length == 2) {
				that[hashSplited[0]] = (!isNaN(hashSplited[1])) ? parseFloat(hashSplited[1]) : hashSplited[1];
				document.getElementById(hashSplited[0]).value = hashSplited[1];
			}
		});

		this.render();
	}

	render() {
		// Time remaining (Hours)
		var d2 = this.time_hour + (this.time_minute / 60);

		// Time modifier
		var e2Calc = regression('polynomial', [this.const_timeRemainingData, this.const_timeModifierData, [d2, null]], 1),
				e2 = (d2 >= 8) ? e2Calc.points[2][1] : 1;

		console.log('-------------- e2', e2);

		// Terrain modifier
		var groundAttacker = parseFloat(this.ground.split(';')[0]),
				groundDefender = parseFloat(this.ground.split(';')[1]);

		// Rating
		var attackdef_team = 0,
				attackdef_opponent = 0;

		if(this.attacker == "team") {
			attackdef_team = Math.round(((this.nb_player_team * (this.const_basedAttackHeroesValue + this.attack_team_hero)) + (this.nb_troop_team * this.attack_team_troop)) * groundAttacker);

			attackdef_opponent = Math.round(((this.nb_player_opponent * (this.const_basedAttackHeroesValue + this.def_opponent_hero)) + (this.nb_troop_opponent * this.def_opponent_troop)) * groundDefender * ( this.tower_level * ( 1 + this.opponent_tower)));

		} else {
			attackdef_team = Math.round(((this.nb_player_team * (this.const_basedAttackHeroesValue + this.def_team_hero)) + (this.nb_troop_team * this.def_team_troop)) * groundDefender * ( this.tower_level * ( 1 + this.team_tower)));

			attackdef_opponent = Math.round(((this.nb_player_opponent * (this.const_basedAttackHeroesValue + this.attack_opponent_hero)) + (this.nb_troop_opponent * this.attack_opponent_troop)) * groundAttacker);
		}

		this.attackdef_team.innerText = this.formatNumber(attackdef_team);
		this.attackdef_opponent.innerText = this.formatNumber(attackdef_opponent);

		// SV
		var svBased = (this.nb_player_team + this.nb_player_opponent) * this.const_basedHeroesValue,
				svBasedTeam = svBased * attackdef_opponent / attackdef_team * e2,
				svBasedOpponent = svBased * attackdef_team / attackdef_opponent * e2;

		var skull_team = (this.attacker == "team") ? Math.round(svBasedTeam - this.skull_win_team + this.skull_win_opponent) : Math.round(svBasedTeam + this.skull_win_opponent - this.skull_win_team),
				skull_opponent = (this.attacker == "team") ? Math.round(svBasedOpponent + this.skull_win_team - this.skull_win_opponent) : Math.round(svBasedOpponent - this.skull_win_opponent + this.skull_win_team);

		this.skull_team.innerText = this.formatNumber(skull_team);
		this.skull_opponent.innerText = this.formatNumber(skull_opponent);

		// Energy cost
		var power_team = Math.round((16 + 16 * attackdef_opponent / attackdef_team) * this.team_power),
				power_opponent = Math.round((16 + 16 * attackdef_team / attackdef_opponent) * this.opponent_power);

		this.power_team.innerText = this.formatNumber(power_team);
		this.power_opponent.innerText  = this.formatNumber(power_opponent);
	}

	formatNumber(num) {
		if(!num || isNaN(num))
			return '0';

		return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
	}
}

const calc = new Calculator();


/*********************
 *    CLOCK TIMER    *
 *********************/

 const timeIcons = ['🕛', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚'];
let intervalId;
let running = false;

const update = (target) => {
	console.log(target)
    if (
        target.id.indexOf('accordion') !== -1 || 
        target.type &&
        ['select', 'input'].indexOf(target.type.toLowerCase()) !== -1
    ) {
        return;
    }

    calc[target.id] = (!isNaN(target.value)) ? parseFloat(target.value) : target.value;
    calc.render();

    // Set hash to share link
    const newHash = target.id + '=' + calc[target.id];
    const replaceRegex = new RegExp(target.id + '=([a-z0-9;.])*', 'gi');
    if (document.location.hash.indexOf(target.id + '=') === -1)
        document.location.hash += '&' + newHash;
    else
        document.location.hash = document.location.hash.replace(replaceRegex, newHash)
};

const updateTimerUi = (hour, minute) => {
    /*
    Updates the hour and minute and the url

    @param hour: hours left
    @param minute: minutes left
    */

    inputs = [
        {'id': 'time_hour', 'value': hour},
        {'id': 'time_minute', 'value': minute},
        {'id': 'time_slider', 'value': hour * 60 + +minute}
    ];

    for (input of inputs) {
        document.querySelector(`#${input.id}`).value = input.value;
        update({'id': input.id, 'value': input.value});
    }
};

const setIcon = (hour) => {
    /*
    Sets the timer icon on an element with the id "timer"

    @param hour: hours left
    */

    const timer = document.querySelector('#timer');

    if (hour === null) {
        // set the timer icon to 0
        timer.innerText = '⏲️';
    } else {
        timer.innerText = timeIcons[hour % 12];
    }
};

const makeClockTimer = (hour, minute, callback) => {
    /*
    Creates a closure and returns a function intended for use in an interval.
    Decrements minutes every time the function is called.
    
    @param hour: hours left
    @param minute: minutes left
    @param callback: function to be called every interval
    
    returns func: An anonymous function to be used in a timeout or interval
    */

    return () => {
        if (hour || minute) {
            // Call the callback
            if (callback && typeof callback === 'function') {
                callback(hour, minute);
            }

            // Decrement the hour counter and reset minutes if needed
            if (!minute) {
                minute = 60;
                hour--;
            }
            minute--;
        } else {
            // Out of time
            if (callback && typeof callback === 'function') {
                callback(null, null);
            }
            // intervalId needs to be in the parent scope since the
            // curried function is called before intervalId exists.
            clearInterval(intervalId);
        }
    }
}

const updateEveryMinute = () => {
    /*
    Event handler to count down and update the UI every minute.
    */

    // Disable button
    document.querySelector('#timer').disabled = true;
    // Enable button after 200ms
    setTimeout(() => document.querySelector('#timer').disabled = false, 200);

    if (running) {
        running = false;
        clearInterval(intervalId);
        setIcon(null);
        return;
    }

    running = true

    // One minute is 60000 milliseconds
    const MINUTE = 60000;

    const startHour =  document.querySelector('#time_hour').value;
    const startMinute = document.querySelector('#time_minute').value;

    // Set the icon
    setIcon(startHour);

    const clockHandler = (hour, minute) => {
        updateTimerUi(hour, minute);
        setIcon(hour);
    };

    intervalId = setInterval(makeClockTimer(startHour, startMinute, clockHandler), MINUTE);
}

window.onload = () => {
	// Inputs
	const container = document.querySelector('#container');
	container.addEventListener('change', e => update(e.target));

    // Timer
    const timerButton = document.querySelector('#timer');
    timerButton.addEventListener('click', updateEveryMinute);

    // Slider
    const slider = document.querySelector('#time_slider');
    const hourInput = document.querySelector('#time_hour');
    const minuteInput = document.querySelector('#time_minute');
    
    const handleSliderChange = () => {
        const hours = Math.floor(slider.value / 60);
        const minutes = slider.value - hours * 60;

        hourInput.value = hours;
        minuteInput.value = minutes;

        for (input of [slider, hourInput, minuteInput]) {
            update(input);
        }
    };

    const handleTimeChange = () => {
        const hours = hourInput.value;
        const minutes = minuteInput.value;
        
        slider.value = hours * 60 + +minutes;

        for (input of [slider, hourInput, minuteInput]) {
            update(input);
        }
    };

    slider.addEventListener('input', handleSliderChange);
    hourInput.addEventListener('input', handleTimeChange);
    minuteInput.addEventListener('input', handleTimeChange);
};
