const COUNTRY_TO_ISO: Record<string, string> = {
  England: 'gb', Brazil: 'br', France: 'fr',
  Spain: 'es', Italy: 'it', Germany: 'de', Portugal: 'pt',
  Netherlands: 'nl', Argentina: 'ar', Belgium: 'be', Croatia: 'hr',
  Denmark: 'dk', Sweden: 'se', Norway: 'no', Finland: 'fi',
  Poland: 'pl', Switzerland: 'ch', Austria: 'at', Greece: 'gr',
  Turkey: 'tr', Ukraine: 'ua', 'Saudi Arabia': 'sa',
  Saudi: 'sa', China: 'cn', Japan: 'jp', 'South Korea': 'kr',
  Australia: 'au', 'United States': 'us', Mexico: 'mx', Canada: 'ca',
  Egypt: 'eg', Morocco: 'ma', Senegal: 'sn', Nigeria: 'ng',
  Ghana: 'gh', Cameroon: 'cm', 'Ivory Coast': 'ci', Tunisia: 'tn',
  Serbia: 'rs', Hungary: 'hu', Romania: 'ro',
  Ireland: 'ie', Scotland: 'gb-sct', Wales: 'gb-wls',
  Russia: 'ru', Czech: 'cz', Slovakia: 'sk',
  Bulgaria: 'bg', Slovenia: 'si',
};

export function getFlagUrl(country: string, width = 40): string {
  const code = COUNTRY_TO_ISO[country];
  if (!code) return '';
  return `https://flagcdn.com/w${width}/${code}.png`;
}
