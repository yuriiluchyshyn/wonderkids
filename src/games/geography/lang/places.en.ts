import { pairs } from './shared';

/** Countries, their flags and capitals in English. A name that takes «the» in a sentence is written with it. */

export const COUNTRIES = pairs(`
ua Ukraine, us the United States, gb the United Kingdom, fr France, de Germany, it Italy,
pl Poland, jp Japan, ca Canada, es Spain, cn China, br Brazil,
tr Turkey, gr Greece, eg Egypt, in India, au Australia, mx Mexico,
ar Argentina, ch Switzerland, se Sweden, no Norway, nl the Netherlands, pt Portugal,
kr South Korea, il Israel, at Austria, cz Czechia, be Belgium, dk Denmark,
fi Finland, ie Ireland, hu Hungary, ro Romania, bg Bulgaria, hr Croatia,
sk Slovakia, lt Lithuania, lv Latvia, ee Estonia, md Moldova, ge Georgia,
sa Saudi Arabia, ae the United Arab Emirates, th Thailand, vn Vietnam, za South Africa, nz New Zealand,
cu Cuba, jm Jamaica, cl Chile, co Colombia, pe Peru, is Iceland,
rs Serbia, si Slovenia, cy Cyprus, mt Malta, lu Luxembourg, mc Monaco,
kz Kazakhstan, am Armenia, az Azerbaijan, uz Uzbekistan, mn Mongolia, pk Pakistan,
id Indonesia, ph the Philippines, my Malaysia, sg Singapore, np Nepal, ir Iran,
iq Iraq, qa Qatar, jo Jordan, lb Lebanon, ma Morocco, tn Tunisia,
dz Algeria, ke Kenya, ng Nigeria, et Ethiopia, gh Ghana, tz Tanzania,
ve Venezuela, uy Uruguay, py Paraguay, bo Bolivia, ec Ecuador, cr Costa Rica,
pa Panama, do the Dominican Republic, ht Haiti, bs the Bahamas, gt Guatemala, hn Honduras,
me Montenegro, mk North Macedonia, al Albania, ba Bosnia and Herzegovina, ad Andorra, li Liechtenstein,
sm San Marino, va Vatican City, kp North Korea, af Afghanistan, bd Bangladesh, lk Sri Lanka,
mm Myanmar, kh Cambodia, la Laos, bt Bhutan, mv the Maldives, kw Kuwait,
bh Bahrain, om Oman, ye Yemen, sy Syria, tj Tajikistan, tm Turkmenistan,
kg Kyrgyzstan, bn Brunei, tl East Timor, ly Libya, sd Sudan, ss South Sudan,
sn Senegal, ci Côte d’Ivoire, cm Cameroon, ug Uganda, rw Rwanda, zw Zimbabwe,
zm Zambia, ao Angola, mz Mozambique, mg Madagascar, na Namibia, bw Botswana,
ml Mali, ne Niger, td Chad, bf Burkina Faso, gn Guinea, sl Sierra Leone,
lr Liberia, tg Togo, bj Benin, ga Gabon, cg the Republic of the Congo, cd the Democratic Republic of the Congo,
cf the Central African Republic, gq Equatorial Guinea, er Eritrea, dj Djibouti, so Somalia, bi Burundi,
mw Malawi, ls Lesotho, sz Eswatini, mr Mauritania, gm the Gambia, gw Guinea-Bissau,
cv Cape Verde, st São Tomé and Príncipe, km the Comoros, sc the Seychelles, mu Mauritius, ni Nicaragua,
sv El Salvador, bz Belize, gy Guyana, sr Suriname, tt Trinidad and Tobago, bb Barbados,
lc Saint Lucia, vc Saint Vincent and the Grenadines, gd Grenada, ag Antigua and Barbuda, dm Dominica, kn Saint Kitts and Nevis,
fj Fiji, pg Papua New Guinea, ws Samoa, to Tonga, vu Vanuatu, sb the Solomon Islands,
ki Kiribati, tv Tuvalu, nr Nauru, pw Palau, fm Micronesia, mh the Marshall Islands
`);

export const LOOKS: Record<string, string> = {
  ua: 'This flag has two stripes: blue like the sky, and yellow like a field of wheat.',
  jp: 'This flag has a red circle in the middle of a white field.',
  fr: 'Three upright stripes: blue, white and red.',
  us: 'Red and white stripes, and a blue corner with little stars.',
  ca: 'A red maple leaf in the middle.',
  br: 'A green flag with a yellow diamond and a blue circle.',
  it: 'Three upright stripes: green, white and red.',
  de: 'Three stripes lying flat: black, red and gold.',
  gb: 'A blue flag with red and white crosses.',
  pl: 'Two stripes: white on top and red below.',
  cn: 'A red flag with yellow stars in the corner.',
  in: 'Orange, white and green stripes, and a blue wheel in the middle.',
  au: 'A blue flag with stars and a little British flag in the corner.',
  eg: 'Red, white and black stripes, and a golden eagle in the middle.',
  es: 'A red stripe, a wide yellow one, and red again.',
  gr: 'Blue and white stripes, and a white cross in the corner.',
  se: 'A blue flag with a yellow cross.',
  ch: 'A red square with a white cross.',
  tr: 'A red flag with a white crescent moon and a star.',
  mx: 'Green, white and red stripes, and an eagle in the middle.',
  ar: 'Light blue, white and light blue stripes, and a little sun in the middle.',
  kr: 'A white flag with a red-and-blue circle in the middle.',
};

export const CAPITALS = pairs(`
ua Kyiv, us Washington, gb London, fr Paris, de Berlin, it Rome, pl Warsaw, jp Tokyo,
ca Ottawa, es Madrid, cn Beijing, br Brasília, tr Ankara, gr Athens, eg Cairo, in New Delhi,
au Canberra, mx Mexico City, ar Buenos Aires, ch Bern, se Stockholm, no Oslo, nl Amsterdam, pt Lisbon,
kr Seoul, at Vienna, cz Prague, be Brussels, dk Copenhagen, fi Helsinki, ie Dublin, hu Budapest,
ro Bucharest, bg Sofia, hr Zagreb, sk Bratislava, lt Vilnius, lv Riga, ee Tallinn, md Chișinău,
ge Tbilisi, sa Riyadh, ae Abu Dhabi, th Bangkok, vn Hanoi, nz Wellington, cu Havana, jm Kingston,
cl Santiago, co Bogotá, pe Lima, is Reykjavík, rs Belgrade, si Ljubljana, cy Nicosia, mt Valletta,
kz Astana, am Yerevan, az Baku, uz Tashkent, mn Ulaanbaatar, pk Islamabad, ph Manila, my Kuala Lumpur,
np Kathmandu, ir Tehran, iq Baghdad, qa Doha, jo Amman, lb Beirut, ma Rabat, ke Nairobi,
ng Abuja, et Addis Ababa, gh Accra, ve Caracas, uy Montevideo, py Asunción, ec Quito, cr San José
`);

/** Continents and oceans as they are named on the map. */
export const REGIONS: Record<string, string> = {
  north_america: 'North America',
  south_america: 'South America',
  europe: 'Europe',
  africa: 'Africa',
  asia: 'Asia',
  australia: 'Australia',
  antarctica: 'Antarctica',
  pacific: 'the Pacific Ocean',
  atlantic: 'the Atlantic Ocean',
  indian: 'the Indian Ocean',
  arctic: 'the Arctic Ocean',
  southern: 'the Southern Ocean',
};

/** «a country in …»: the part of the world a country belongs to. */
export const IN_CONTINENT: Record<string, string> = {
  europe: 'Europe',
  asia: 'Asia',
  africa: 'Africa',
  north_america: 'North America',
  south_america: 'South America',
  australia: 'Australia and Oceania',
};
