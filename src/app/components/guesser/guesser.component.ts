import {Component, ContentChild, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {catchError, map, startWith, tap} from 'rxjs/operators';
import { HttpClient } from "@angular/common/http";


import {countries} from './countries'
import {countriesDict} from './countriesDict'

export interface State {
  flag: string;
  name: string;
  population: string;
}

export interface Country {
  code: string;
  lat: number;
  long: number;
  name: string;
}

@Component({
  selector: 'app-guesser',
  templateUrl: './guesser.component.html',
  styleUrls: ['./guesser.component.css']
})
export class GuesserComponent implements OnInit {
  stateCtrl = new FormControl('');
  countryCtrl = new FormControl('');
  filteredStates: Observable<State[]>;
  filteredCountries: Observable<Country[]>;
  solution: Country;
  bearing: number;
  distance: number;
  progress: number;

  guessButtonDisabled: boolean;
  playButtonDisabled: boolean;
  gameEnded: boolean;
  helpOpen: boolean;

  guessTries: number;
  result: string;

  guesses: Country[];

  countries: Country[] = countries;
  countriesDict: Object = countriesDict;


  states: State[] = [
    {
      name: 'Arkansas',
      population: '2.978M',
      // https://commons.wikimedia.org/wiki/File:Flag_of_Arkansas.svg
      flag: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Flag_of_Arkansas.svg',
    },
    {
      name: 'California',
      population: '39.14M',
      // https://commons.wikimedia.org/wiki/File:Flag_of_California.svg
      flag: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Flag_of_California.svg',
    },
    {
      name: 'Florida',
      population: '20.27M',
      // https://commons.wikimedia.org/wiki/File:Flag_of_Florida.svg
      flag: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Flag_of_Florida.svg',
    },
    {
      name: 'Texas',
      population: '27.47M',
      // https://commons.wikimedia.org/wiki/File:Flag_of_Texas.svg
      flag: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Flag_of_Texas.svg',
    },
  ];

  constructor(private http: HttpClient) {
    //console.log('called constructor')

    this.filteredStates = this.stateCtrl.valueChanges.pipe(
      startWith(''),
      map(state => (state ? this._filterStates(state) : this.states.slice())),
    );
    this.filteredCountries = this.countryCtrl.valueChanges.pipe(
      startWith(''),
      map(country => (country ? this._filterCountries(country) : this.countries.slice())),
    );
  }

  ngOnInit() {
    //console.log('called init')

    this.solution = this.countries[Math.floor(Math.random()*this.countries.length)];
    console.log("Solution: " + this.solution.name)

    //this.getCountries()
    //console.log(this.convertArrayToObject(countries,'name'))

    this.guessTries = 6
    this.guesses = []
    this.countryCtrl.enable()
    this.result = this.guessTries + " tries left"
    this.countryCtrl.reset()
    this.guessButtonDisabled = false
    this.playButtonDisabled = false
    this.bearing = 0
    this.distance = 40075
    this.progress = 0
    this.gameEnded = false
    this.helpOpen = false
  }

  openHelp(){
    this.helpOpen = true
  }

  closeHelp(){
    this.helpOpen = false
  }



  getProgress(distance){
    return (1-(distance/40075))*100
  }

  getBearing(startLat, startLng, destLat, destLng){
    startLat = this.deg2rad(startLat);
    startLng = this.deg2rad(startLng);
    destLat = this.deg2rad(destLat);
    destLng = this.deg2rad(destLng);
  
    let y = Math.sin(destLng - startLng) * Math.cos(destLat);
    let x = Math.cos(startLat) * Math.sin(destLat) -
          Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
    let brng = Math.atan2(y, x);
    brng = this.rad2deg(brng);

    return (brng + 360) % 360;
  }

  getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = this.deg2rad(lat2-lat1);  // deg2rad below
    var dLon = this.deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km

    return Math.floor(d);
  }
  
  deg2rad(deg) {
    return deg * (Math.PI/180)
  }

  rad2deg(radians) {
    return radians * 180 / Math.PI;
  }

  convertArrayToObject = (array, key) => {
    const initialValue = {};
    return array.reduce((obj, item) => {
      return {
        ...obj,
        [item[key]]: item,
      };
    }, initialValue);
  };

  getCountries(){
    this.http.get('../../assets/countries.csv', {responseType: 'text'})
    .subscribe(
        (data => {
            let llist: Country[] = [];
            let csvList = data.split("\n")
            csvList.shift()
            csvList.forEach(function (x) {
              let row = x.split(',');
              let c : Country = {code: row[0].replace(/[^a-zA-Z0-9 ]/g, '').toLowerCase(), name: row[1].replace(/[^a-zA-Z0-9 ]/g, ''), lat: parseFloat(row[2]), long: parseFloat(row[3])};
              llist.push(c);
            })
            llist.sort((a, b) => (a.name > b.name) ? 1 : -1)
            this.countries = llist
            console.log(this.countries);

            this.solution = this.countries[Math.floor(Math.random()*this.countries.length)];
            console.log("Solution: " + this.solution.name)

        }),(error => console.log(error)))
  }

  checkGuess(){

    if(this.countryCtrl.value == null || countriesDict[this.countryCtrl.value] ==  undefined){
      return
    }

    //console.log(this.guessTries)

    let c = countriesDict[this.countryCtrl.value]

    this.bearing = this.getBearing(c.lat,c.long,this.solution.lat,this.solution.long)
    this.distance = this.getDistanceFromLatLonInKm(c.lat,c.long,this.solution.lat,this.solution.long)
    this.progress = this.getProgress(this.distance)

    if(this.countryCtrl.value == this.solution.name){
      this.result = "Right"
      this.guesses.unshift(c)
      this.gameOver("CONGRAULATIONS !!!")
      return
    }else{
      this.guessTries -= 1
      this.result = this.guessTries + " tries left"
      this.guesses.unshift(c)
      this.countryCtrl.reset()
      if(this.guessTries == 0){
        this.gameOver("GAME OVER")
        return
      }
    }

  }

  gameOver(message: string){
    this.countryCtrl.disable()
    this.result=message 
    this.guessButtonDisabled = true
    this.gameEnded = true
  }

  resetGame(){
    this.ngOnInit();
  }

  private _filterStates(value: string): State[] {
    const filterValue = value.toLowerCase();

    return this.states.filter(state => state.name.toLowerCase().includes(filterValue));
  }

  private _filterCountries(value: string): Country[] {
    const filterValue = value.toLowerCase();

    return this.countries.filter(country => country.name.toLowerCase().includes(filterValue));
  }
}
