window.Scorer = window.Scorer || {};

window.Scorer.data = (() => {
  const STATES = {
    AL: { code: 'AL', name: 'Alabama' },
    AK: { code: 'AK', name: 'Alaska' },
    AZ: { code: 'AZ', name: 'Arizona' },
    AR: { code: 'AR', name: 'Arkansas' },
    CA: { code: 'CA', name: 'California' },
    CO: { code: 'CO', name: 'Colorado' },
    CT: { code: 'CT', name: 'Connecticut' },
    DE: { code: 'DE', name: 'Delaware' },
    FL: { code: 'FL', name: 'Florida' },
    GA: { code: 'GA', name: 'Georgia' },
    HI: { code: 'HI', name: 'Hawaii' },
    ID: { code: 'ID', name: 'Idaho' },
    IL: { code: 'IL', name: 'Illinois' },
    IN: { code: 'IN', name: 'Indiana' },
    IA: { code: 'IA', name: 'Iowa' },
    KS: { code: 'KS', name: 'Kansas' },
    KY: { code: 'KY', name: 'Kentucky' },
    LA: { code: 'LA', name: 'Louisiana' },
    ME: { code: 'ME', name: 'Maine' },
    MD: { code: 'MD', name: 'Maryland' },
    MA: { code: 'MA', name: 'Massachusetts' },
    MI: { code: 'MI', name: 'Michigan' },
    MN: { code: 'MN', name: 'Minnesota' },
    MS: { code: 'MS', name: 'Mississippi' },
    MO: { code: 'MO', name: 'Missouri' },
    MT: { code: 'MT', name: 'Montana' },
    NE: { code: 'NE', name: 'Nebraska' },
    NV: { code: 'NV', name: 'Nevada' },
    NH: { code: 'NH', name: 'New Hampshire' },
    NJ: { code: 'NJ', name: 'New Jersey' },
    NM: { code: 'NM', name: 'New Mexico' },
    NY: { code: 'NY', name: 'New York' },
    NC: { code: 'NC', name: 'North Carolina' },
    ND: { code: 'ND', name: 'North Dakota' },
    OH: { code: 'OH', name: 'Ohio' },
    OK: { code: 'OK', name: 'Oklahoma' },
    OR: { code: 'OR', name: 'Oregon' },
    PA: { code: 'PA', name: 'Pennsylvania' },
    RI: { code: 'RI', name: 'Rhode Island' },
    SC: { code: 'SC', name: 'South Carolina' },
    SD: { code: 'SD', name: 'South Dakota' },
    TN: { code: 'TN', name: 'Tennessee' },
    TX: { code: 'TX', name: 'Texas' },
    UT: { code: 'UT', name: 'Utah' },
    VT: { code: 'VT', name: 'Vermont' },
    VA: { code: 'VA', name: 'Virginia' },
    WA: { code: 'WA', name: 'Washington' },
    WV: { code: 'WV', name: 'West Virginia' },
    WI: { code: 'WI', name: 'Wisconsin' },
    WY: { code: 'WY', name: 'Wyoming' },
  };

  const SPECIES = ['Bear', 'Turkey'];

  const MANAGERS = [
    {
      id: 'pa-ne',
      name: 'Pennsylvania Bear & Turkey',
      state: 'PA',
      seasonWindow: 'Fall 2026',
      species: ['Bear', 'Turkey'],
      isGroundTruth: true,
      regulationCount: 71,
      ruleCount: 15,
      lastCuratedAt: '2026-04-22',
      curatedBy: 'Rafael Flores',
      lastUsedAt: '2026-05-04',
    },
    {
      id: 'mn-z2',
      name: 'Minnesota Bear & Turkey',
      state: 'MN',
      seasonWindow: 'Fall 2026',
      species: ['Bear', 'Turkey'],
      isGroundTruth: true,
      regulationCount: 2,
      ruleCount: 50,
      lastCuratedAt: '2026-04-15',
      curatedBy: 'Nicolas Rivera',
      lastUsedAt: '2026-04-30',
    },
    {
      id: 'tx-south',
      name: 'Texas Turkey',
      state: 'TX',
      seasonWindow: 'Spring 2026',
      species: ['Turkey'],
      isGroundTruth: true,
      regulationCount: 6,
      ruleCount: 6,
      lastCuratedAt: '2026-03-30',
      curatedBy: 'Rafael Flores',
      lastUsedAt: '2026-04-12',
    },
    {
      id: 'sd-bh',
      name: 'South Dakota Bear & Turkey',
      state: 'SD',
      seasonWindow: 'Fall 2026',
      species: ['Bear', 'Turkey'],
      isGroundTruth: true,
      regulationCount: 6,
      ruleCount: 6,
      lastCuratedAt: '2026-04-29',
      curatedBy: 'Nicolas Rivera',
      lastUsedAt: '2026-05-02',
    },
    {
      id: 'mt-d2',
      name: 'Montana Bear',
      state: 'MT',
      seasonWindow: 'Fall 2026',
      species: ['Bear'],
      isGroundTruth: true,
      regulationCount: 6,
      ruleCount: 5,
      lastCuratedAt: '2026-04-01',
      curatedBy: null,
      lastUsedAt: null,
    },
    {
      id: 'co-biggame',
      name: 'Colorado Big Game',
      state: 'CO',
      seasonWindow: 'Fall 2026',
      species: ['Bear', 'Elk'],
      isGroundTruth: true,
      regulationCount: 7,
      ruleCount: 7,
      lastCuratedAt: '2026-04-18',
      curatedBy: 'Rafael Flores',
      lastUsedAt: '2026-05-01',
    },
    {
      id: 'wy-bear',
      name: 'Wyoming Bear',
      state: 'WY',
      seasonWindow: 'Spring 2026',
      species: ['Bear'],
      isGroundTruth: true,
      regulationCount: 6,
      ruleCount: 5,
      lastCuratedAt: '2026-04-10',
      curatedBy: 'Nicolas Rivera',
      lastUsedAt: null,
    },
    {
      id: 'ny-bear-turkey',
      name: 'New York Bear & Turkey',
      state: 'NY',
      seasonWindow: 'Fall 2026',
      species: ['Bear', 'Turkey'],
      isGroundTruth: true,
      regulationCount: 7,
      ruleCount: 7,
      lastCuratedAt: '2026-04-20',
      curatedBy: 'Rafael Flores',
      lastUsedAt: '2026-04-25',
    },
  ];

  const RULE_TYPES = [
    'Bag Limit',
    'Season Dates',
    'Weapon Restriction',
    'License Required',
    'Antler / Sex Restriction',
    'Hunter Education',
    'Reporting',
    'Tag Requirement',
    'Hours of Take',
    'Method of Take',
  ];

  const SEASON_TYPES = ['Archery', 'Firearm', 'Muzzleloader', 'General'];
  const SEX_TYPES = ['MALE', 'FEMALE', 'EITHER'];
  const WEAPON_CATEGORIES = ['Archery', 'Crossbow', 'Shotgun', 'Rifle', 'Muzzleloader', 'Handgun'];
  const HUNTER_TYPES = ['resident', 'non_resident', 'youth', 'senior'];
  const CURRENCIES = ['USD'];

  const LICENSES = [
    { id: 'lic-pa-gen',    stateCode: 'PA', name: 'General Hunting License', purchasingType: 'otc' },
    { id: 'lic-pa-bear',   stateCode: 'PA', name: 'Bear License',           purchasingType: 'otc' },
    { id: 'lic-pa-turkey', stateCode: 'PA', name: 'Turkey License',         purchasingType: 'otc' },
    { id: 'lic-pa-arch',   stateCode: 'PA', name: 'Archery Stamp',          purchasingType: 'otc_addon', requiresLicenseId: 'lic-pa-gen' },
    { id: 'lic-mn-gen',    stateCode: 'MN', name: 'Small Game License',     purchasingType: 'otc' },
    { id: 'lic-mn-bear',   stateCode: 'MN', name: 'Bear License',           purchasingType: 'otc' },
    { id: 'lic-mn-turkey', stateCode: 'MN', name: 'Turkey Permit',          purchasingType: 'draw' },
    { id: 'lic-tx-gen',    stateCode: 'TX', name: 'Hunting License',        purchasingType: 'otc' },
    { id: 'lic-tx-turkey', stateCode: 'TX', name: 'Turkey Stamp',           purchasingType: 'otc_addon', requiresLicenseId: 'lic-tx-gen' },
    { id: 'lic-sd-bear',   stateCode: 'SD', name: 'Black Hills Bear Tag',   purchasingType: 'draw' },
  ];

  const LOCATIONS = [
    { id: 'loc-pa', stateCode: 'PA', name: 'Pennsylvania', type: 'STATE',   parentId: null },
    { id: 'loc-pa-ne', stateCode: 'PA', name: 'Northeast Region', type: 'REGION', parentId: 'loc-pa' },
    { id: 'loc-pa-z2', stateCode: 'PA', name: 'WMU 2A', type: 'WMU', parentId: 'loc-pa-ne' },
    { id: 'loc-pa-z3', stateCode: 'PA', name: 'WMU 2B', type: 'WMU', parentId: 'loc-pa-ne' },
    { id: 'loc-pa-z4', stateCode: 'PA', name: 'WMU 2C', type: 'WMU', parentId: 'loc-pa-ne' },
    { id: 'loc-pa-wma1', stateCode: 'PA', name: 'State Game Lands 045', type: 'WMA', parentId: 'loc-pa-z2' },
    { id: 'loc-pa-wma2', stateCode: 'PA', name: 'State Game Lands 057', type: 'WMA', parentId: 'loc-pa-z3' },
    { id: 'loc-mn', stateCode: 'MN', name: 'Minnesota', type: 'STATE', parentId: null },
    { id: 'loc-mn-z2', stateCode: 'MN', name: 'Zone 2 Northwest', type: 'ZONE', parentId: 'loc-mn' },
    { id: 'loc-mn-z2-1', stateCode: 'MN', name: 'Permit Area 12', type: 'PERMIT_AREA', parentId: 'loc-mn-z2' },
  ];

  const WEAPON_SPECS_SCHEMA = {
    'Shotgun':     { gauge: ['10', '12', '20', '28', '.410'], shot_size: ['BB', '2', '4', '6', '7.5', '8'], choke: ['cylinder', 'modified', 'full'] },
    'Rifle':       { caliber: ['.22', '.243', '.270', '.308', '.30-06', '.300 Win Mag'], action: ['bolt', 'lever', 'semi-auto'] },
    'Archery':     { draw_weight_min: ['35 lbs', '40 lbs', '45 lbs', '50 lbs'], type: ['compound', 'recurve', 'longbow'] },
    'Crossbow':    { draw_weight_min: ['100 lbs', '125 lbs', '150 lbs'], cocking: ['hand', 'crank', 'rope'] },
    'Muzzleloader':{ caliber: ['.40', '.45', '.50', '.54'], ignition: ['flintlock', 'percussion', 'in-line'] },
    'Handgun':     { caliber: ['.357', '.44 Mag', '10mm'], action: ['revolver', 'semi-auto'] },
  };

  const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const WEEKS_OF_MONTH = ['1st', '2nd', '3rd', '4th', '5th'];

  const ELIGIBILITY_CATEGORIES = [
    { id: 'elig-youth',     name: 'Youth',     description: 'Under 18, supervision required' },
    { id: 'elig-senior',    name: 'Senior',    description: 'Age 65+' },
    { id: 'elig-mentored',  name: 'Mentored',  description: 'New hunter under licensed mentor' },
    { id: 'elig-resident',  name: 'Resident',  description: 'State resident' },
    { id: 'elig-disabled',  name: 'Disabled',  description: 'Permit for disabled hunters' },
  ];

  let ruleCounter = 1;
  const rule = (managerId, partial) => ({
    id: 'r-' + String(ruleCounter++).padStart(4, '0'),
    managerId,
    species: '',
    ruleType: '',
    seasonType: '',
    legalLabel: '',
    huntCode: '',
    sex: 'EITHER',
    bagLimit: '',
    startDate: '',
    endDate: '',
    summary: '',
    weaponCategories: [],
    ...partial,
  });

  let regCounter = 1;
  const reg = (managerId, partial) => ({
    id: 'g-' + String(regCounter++).padStart(4, '0'),
    managerId,
    title: '',
    content: '',
    species: [],
    ...partial,
  });

  const REGULATIONS = [
    reg('pa-ne', { title: 'Hunter Education Requirement', content: 'Resident and nonresident hunters born after Jan. 1, 1972, must satisfactorily complete a hunter education course in order to obtain a hunting license.', species: [] }),
    reg('pa-ne', { title: 'License and Fee Requirements', content: 'All residents and nonresidents 16 years of age and older are required to have a valid Hunting License on their person, and have paid all applicable fees and possess all required stamps while hunting game or participating in the hunt. Participation in a hunt includes, but is not limited to: handling firearms or ammunition during the hunt; trying ...', species: [] }),
    reg('pa-ne', { title: 'Habitat Fee Requirement', content: 'Iowa residents age 16 to 64, and nonresidents age 16 and older, who are required to have a hunting or furharvester license must pay the wildlife habitat fee to hunt or trap.', species: [] }),
    reg('pa-ne', { title: 'Iowa Migratory Game Bird Fee', content: 'All residents and nonresidents 16 years of age and older must pay the Iowa Migratory Game Bird Fee to hunt wild geese, brant, ducks, snipe, rail, woodcock, gallinule or coot. The fee must be paid even if a Hunting License is not required.', species: ['Goose', 'Brant', 'Duck', 'Common Snipe', 'Sora', 'Virginia Rail', 'Woodcock', 'American Coot'] }),
    reg('pa-ne', { title: 'Federal Migratory Bird Hunting and Conservation Stamp', content: 'The law requires that each waterfowl hunter 16 years of age and older must carry on his person a Migratory Bird Hunting and Conservation Stamp (Federal Duck Stamp) that is validated by the hunter signing the stamp in ink across the face of the stamp. The Stamp is required even if a Hunting License is not required.', species: ['Waterfowl'] }),
    reg('pa-ne', { title: 'Furharvester License Requirements', content: 'All residents and nonresidents age 16 and older must have a Furharvester License to trap or hunt furbearing animals. A Hunting License is not needed to hunt furbearers. A person under age 16 years is not required to have a Furharvester License to trap fur-bearing animals if accompanied by an adult who possess a valid Furharvester License while t...', species: [] }),
    reg('pa-ne', { title: 'Coyote and Groundhog License Requirements', content: 'Coyote and groundhog may be hunted with either a Furharvester License or a Hunting License.', species: ['Coyote', 'Groundhog'] }),
    reg('pa-ne', { title: 'Unlicensed Youth Hunters', content: 'Residents and nonresidents under 16 years old who hunt under the direct supervision of their properly licensed parent, guardian, or other competent adult with the consent of the parent or guardian do not need a Hunting License or pay the Habitat or Migratory Game Bird fee. One properly licensed adult must accompany each unlicensed hunter under 1...', species: [] }),
    reg('pa-ne', { title: 'Hunter Orange Requirement for Upland Game', content: 'To hunt pheasant, quail, gray partridge and ruffed grouse you must wear at least one of the following articles of visible, external apparel with at least 50 percent of its surface area solid blaze orange in color: hat, cap, vest, coat, jacket, sweatshirt, shirt or coveralls.', species: ['Ring-necked Pheasant', 'Bobwhite Quail', 'Gray Partridge', 'Ruffed Grouse'] }),
    reg('pa-ne', { title: 'Transporting Pheasants', content: 'A foot, fully feathered wing, or fully feathered head must remain attached to any pheasant transported within the state. The bird may be field dressed, but the carcass must remain intact.', species: ['Ring-necked Pheasant'] }),
    reg('pa-ne', { title: 'Reporting Hunting Accidents', content: 'Anyone involved in a hunting accident involving a firearm, or a fall that allows a person to hunt from an elevated position, which results in a personal injury or property damage exceeding $100, must report the accident within 12 hours to the sheriff\'s office in the county where the accident occurred, to the local conservation officer, or if ne...', species: [] }),
    reg('pa-ne', { title: 'Tree Damage from Blinds', content: 'You may not drive or in any other way place any nail, spike, pin, or any other metal object into a tree on game management areas to construct a blind or to provide hunting access to a location above the ground.', species: [] }),
    reg('pa-ne', { title: 'Constructing Blinds', content: 'You may construct a blind using only the natural vegetation found in the area, except that no trees or parts of trees other than willows can be cut for that purpose. The use of all blinds on game management areas is on a first-come, first-served basis regardless of type or construction.', species: [] }),
    reg('pa-ne', { title: 'Portable Blinds on Game Management Areas', content: 'Portable, or pop-up, blinds are prohibited on game management areas from one hour after sunset until midnight each day. Portable blinds left unattended during permissible hours do not guarantee the owner exclusive use of the blind, or exclusive use of the site. Portable blinds which are built on, or are part of, a boat, shall be considered remov...', species: [] }),
    reg('pa-ne', { title: 'Permanent Tree Stands', content: 'You may not construct a permanent tree stand on game management areas.', species: [] }),
    reg('pa-ne', { title: 'Decoy Restrictions', content: 'A decoy is a likeness of a bird or animal used to lure game within shooting range. Decoys are prohibited on all game management areas from one-half hour after sunset until midnight each day. Decoys are considered removed from an area if they are in a boat or other container at an approved access site. Decoys cannot be left unattended for more th...', species: [] }),
    reg('pa-ne', { title: 'Motorized Decoys', content: 'Motorized or mechanical decoys are legal for waterfowl hunting.', species: ['Waterfowl'] }),
    reg('pa-ne', { title: 'Drone Use', content: 'Drones are considered aircraft by the U.S. Federal Government. The use of drones while hunting is not allowed.', species: [] }),
    reg('pa-ne', { title: 'Importing Out-of-State Game', content: 'You may possess game that has been lawfully taken outside the state and lawfully brought into the state, but you must be able to prove it was legally killed and legally transported into the state.', species: [] }),
    reg('pa-ne', { title: 'Retrieval and Waste of Game', content: 'While taking or attempting to take game or furbearing animals, you cannot abandon the injured animal without making a reasonable effort to retrieve it from the field. You cannot leave a usable portion of the game or furbearing animal in the field.', species: [] }),
    reg('pa-ne', { title: 'Showing License to Officer', content: 'Upon request, you must show your license, certificate or permit to any peace officer or the owner or person in lawful control of the land or water on which you are hunting or trapping. You must have in your possession either in license form or electronically, your license, certificate or permit.', species: [] }),
    reg('pa-ne', { title: 'Use of Radios and Cell Phones', content: 'You cannot use a one or two-way mobile radio transmitter, including cell phones and cellular trail cameras capable of sending images or video while actively hunting, to communicate the location or direction of game or furbearing animals, or to coordinate the movement of other hunters.', species: [] }),
    reg('pa-ne', { title: 'Possession and Storage of Game', content: 'A person having lawful possession of game or furbearing animals or pelts taken with a valid license by that person, may hold, possess or store the game or furbearing animals or pelts in an amount that does not exceed the possession limit until the day before the first day of the next open season for that game or furbearing animal.', species: [] }),
    reg('pa-ne', { title: 'Obstruction of Hunting or Trapping', content: 'A person shall not interfere with the lawful hunting or trapping activities of another person where hunting or trapping is authorized by a custodian of public property or an owner or lessee of private property.', species: [] }),
    reg('pa-ne', { title: 'Selling Protected Game', content: 'You cannot buy or sell, dead or alive, a bird or animal, including fish, or any part of one that is protected. This does not apply to furbearing animals and the skins, plumage and antlers of legally taken game.', species: [] }),
    reg('pa-ne', { title: 'Prohibited Hunting Near Buildings', content: 'You cannot discharge a firearm, or shoot or attempt to shoot, a game or furbearing animal within 200 yards of a building inhabited by people or domestic livestock or a feedlot unless the owner or tenant has given consent to do so.', species: [] }),
    reg('pa-ne', { title: 'Artificial Light and Laser Sights', content: 'Sights that project a light beam, including laser sights, are not legal for hunting. You cannot cast the rays of a spotlight, headlight or other artificial light on a highway or in a field, woodland or forest for the purpose of spotting, locating, taking or attempting to take or hunt an animal, while having in possession or control, either singl...', species: [] }),
    reg('pa-ne', { title: 'Infrared Light Source for Coyotes', content: 'A person may use an infrared light source to hunt coyotes as long as the infrared light source is mounted to the method of take or to a scope mounted on the method of take. HOWEVER, no person shall use an infrared light source to hunt coyotes during any established muzzleloader, bow, or shotgun deer hunting season.', species: ['Coyote'] }),
    reg('pa-ne', { title: 'Shooting Over Water or Highway', content: 'You cannot shoot any rifle on or over any of the public highways, regardless of surface type, or waters of the state or any railroad right-of-way. You cannot discharge a shotgun shooting a slug, pistol or revolver on or over a public roadway.', species: [] }),
    reg('pa-ne', { title: 'Hunting from Aircraft or Snowmobiles', content: 'A person shall not intentionally kill or wound, attempt to kill or wound, or pursue any animal, fowl, or fish from or with an aircraft or drone in flight, or from or with any vehicles commonly known as snowmobiles.', species: [] }),
    reg('pa-ne', { title: 'Motor Vehicle Restrictions on Game Management Areas', content: 'Motor vehicles are prohibited on a game management areas except on constructed and designated roads and parking lots unless specifically permitted.', species: [] }),
    reg('pa-ne', { title: 'Wildlife Refuges', content: 'It shall be unlawful to hunt, pursue, kill, trap, or take any wild animal, bird, or game on Wildlife Refuges at any time, and no one shall carry firearms thereon, except where and when specifically authorized by the DNR.', species: [] }),
    reg('pa-ne', { title: 'Harvest Information Program Registration', content: 'All licensed migratory game bird hunters are required to register with HIP prior to hunting.', species: ['Duck', 'Goose', 'Mourning Dove', 'Eurasian Collared Dove', 'American Coot', 'Woodcock', 'Sora', 'Virginia Rail', 'Common Snipe'] }),
    reg('pa-ne', { title: 'Prohibited Methods for Migratory Game Birds', content: 'No persons shall take migratory game birds with a trap, snare, net, crossbow, rifle, pistol, swivel gun, shotgun larger than 10 gauge, punt gun, battery gun, machine gun, fish hook, poison, drug, explosive, or stupefying substance.', species: ['Duck', 'Goose', 'Mourning Dove', 'Eurasian Collared Dove', 'American Coot', 'Woodcock', 'Sora', 'Virginia Rail', 'Common Snipe'] }),
    reg('pa-ne', { title: 'Shotgun Capacity for Migratory Game Birds', content: 'No persons shall take migratory game birds with a shotgun capable of holding more than three shells, unless it is plugged with a one-piece filler that is incapable of being removed without disassembling the gun.', species: ['Duck', 'Goose', 'Mourning Dove', 'Eurasian Collared Dove', 'American Coot', 'Woodcock', 'Sora', 'Virginia Rail', 'Common Snipe'] }),
    reg('pa-ne', { title: 'Baiting Migratory Game Birds', content: 'No persons shall take migratory game birds by the aid of baiting, or on or over any baited area, where a person knows or reasonably should know that the area is or has been baited.', species: ['Duck', 'Goose', 'Mourning Dove', 'Eurasian Collared Dove', 'American Coot', 'Woodcock', 'Sora', 'Virginia Rail', 'Common Snipe'] }),
    reg('pa-ne', { title: 'Nontoxic Shot Requirement', content: 'No person may take ducks, geese (including brant), rails, snipe, or coots while possessing shot (either in shotshells or as loose shot for muzzleloading) other than approved nontoxic shot.', species: ['Duck', 'Goose', 'Brant', 'Sora', 'Virginia Rail', 'Common Snipe', 'American Coot'] }),
    reg('pa-ne', { title: 'Lead Shot for Doves', content: 'Hunters may use lead shot to hunt doves, except on the wildlife areas listed that require nontoxic shot.', species: ['Mourning Dove', 'Eurasian Collared Dove'] }),
    reg('pa-ne', { title: 'Species Identification Requirement for Transportation', content: 'No person shall transport within the United States any migratory game birds, except doves and band-tailed pigeons, unless the head or one fully feathered wing remains attached to each such bird at all times while being transported from the place where taken until they have arrived at the personal abode of the possessor or a migratory bird preser...', species: ['Duck', 'Goose', 'American Coot', 'Woodcock', 'Sora', 'Virginia Rail', 'Common Snipe'] }),
    reg('pa-ne', { title: 'Tagging Requirement for Migratory Game Birds', content: 'No person shall put or leave any migratory game birds at any place, or in the custody of another person, unless such birds have a tag attached, signed by the hunter, stating his address, the total number and species of birds, and the date such birds were killed. No person shall receive or have in custody any migratory game birds belonging to ano...', species: ['Duck', 'Goose', 'Mourning Dove', 'Eurasian Collared Dove', 'American Coot', 'Woodcock', 'Sora', 'Virginia Rail', 'Common Snipe'] }),
    reg('pa-ne', { title: 'Disturbing Dens', content: 'You cannot molest or disturb, in any manner, any den, lodge or house of a furbearing animal or beaver dam except by written permission of an officer appointed by the director of the DNR. You cannot use any chemical, explosive, smoking device, mechanical ferret, wire, tool, instrument or water to remove furbearing animals from their dens.', species: [] }),
    reg('pa-ne', { title: 'Box Traps', content: 'A person shall not use or attempt to use colony traps in taking, capturing, trapping or killing any game or furbearing animals except muskrats. A valid hunting license is required for box trapping cottontail rabbits and squirrels.', species: ['Muskrat', 'Cottontail Rabbit', 'Squirrel'] }),
    reg('pa-ne', { title: 'Removal of Animals from Traps and Snares', content: 'All animals or animal carcasses caught in any type of trap or snare, except those that are placed entirely under water and designed to drown the animal immediately, must be removed from the trap or snare by the trap or snare user immediately upon discovery and within 24 hours of the time the animal is caught.', species: [] }),
    reg('pa-ne', { title: 'Snare Restrictions', content: 'No person shall set or maintain any snare in any public road right-of-way so the snare, when fully extended, can touch any fence. A snare set on private land other than roadsides within 30 yards of a pond, lake, creek, drainage ditch, stream or river must have a loop size of 11 inches or less in horizontal measurement. All other snares must have...', species: [] }),
    reg('pa-ne', { title: 'Mechanical Snares', content: 'It is illegal to set any mechanically-powered snare designed to capture an animal by the neck or body unless the snare is placed completely under water.', species: [] }),
    reg('pa-ne', { title: 'Body-Gripping Traps', content: 'You cannot set or maintain any body-gripping trap on any public road right-of-way within 5 feet of any fence. Humane traps, or traps designed to kill instantly, with a jaw spread as originally manufactured with an outside measurement that exceeds 8 inches, are unlawful to use except when placed entirely under water.', species: [] }),
    reg('pa-ne', { title: 'Foothold Traps', content: 'You cannot set or maintain, on land, any foothold trap with metal serrated jaws, metal-toothed jaws or a spread inside the set jaws greater than 7 inches as measured to the outside edge.', species: [] }),
    reg('pa-ne', { title: 'Trap Tag Requirements', content: 'All traps and snares, whether set or not, possessed by a person who can reasonably be presumed to be trapping must have a metal tag attached, plainly labeled with the user\'s name and address.', species: [] }),
    reg('pa-ne', { title: 'Tagging Requirements for Otter and Bobcat', content: 'Furharvesters must contact a Conservation Officer within seven days of taking an otter or bobcat to receive a CITES tag. The CITES tag must remain with the animal until it is sold. Animals kept for taxidermy or other display or educational purposes must have the CITES tag retained at all times.', species: ['River Otter', 'Bobcat'] }),
    reg('pa-ne', { title: 'Accidental Capture of Otter and Bobcat', content: 'Otters and bobcats accidentally captured after the season has closed and bobcats accidentally captured in an area of the state closed to bobcat harvesting, should be immediately released alive, if possible, or must be turned over to the DNR, without penalty, if dead.', species: ['River Otter', 'Bobcat'] }),
    reg('pa-ne', { title: 'Deer Tagging Requirements', content: 'The head and antlers (if any) must remain attached to the carcass until it is processed for consumption. No person shall tag a deer with a tag that was purchased after the deer was taken. A hunter may not carry a deer license or transportation tag issued to another hunter while deer hunting.', species: ['Deer'] }),
    reg('pa-ne', { title: 'Blood Tracking Wounded Deer with a Dog', content: 'A dog may not be used to hunt deer. However, a person having a valid hunting license and a valid deer hunting license who has wounded a deer while hunting may use a dog to track and retrieve the wounded deer. The person must maintain physical control of the dog at all times during the search by means of a maximum 50-foot lead attached to the dog...', species: ['Deer'] }),
    reg('pa-ne', { title: 'Blaze Orange Required for Deer Hunting', content: 'To hunt deer with a firearm in any season you must wear one of the following articles of external, visible, solid blaze orange clothing: vest, jacket, coat, sweatshirt, sweater, shirt or coveralls. An orange hat alone is not sufficient. No person shall use a blind for hunting deer during the regular shotgun deer seasons unless such blind exhibit...', species: ['Deer'] }),
    reg('pa-ne', { title: 'Prohibited Devices and Activities for Deer Hunting', content: 'You may not use domestic animals, bait, radios, automobiles, aircraft, drones, electronic calls or any mechanical conveyance or device to hunt deer.', species: ['Deer'] }),
    reg('pa-ne', { title: 'Archery Equipment Specifications for Deer Hunting', content: 'Longbows, recurve bows, and compound bows shooting broadhead arrows are permitted. No explosive or chemical devices may be attached to the arrow or broadhead. There are no minimum draw weights for bows or minimum diameter for broadheads. Arrows must be at least 18 inches long. Crossbows are not legal during the archery season except that a physi...', species: ['Deer'] }),
    reg('pa-ne', { title: 'Shotgun Specifications for Deer Hunting', content: '10-, 12-, 16-, and 20-gauge shotguns shooting single slugs only.', species: ['Deer'] }),
    reg('pa-ne', { title: 'Muzzleloader Specifications for Deer Hunting', content: 'Only muzzleloading rifles, muzzleloading muskets, muzzleloading pistols, and muzzleloading revolvers between .44 and .775 of an inch shooting a single projectile. Muzzleloaders equipped with electronic ignition are not allowed. In-line and disk-type muzzleloaders are allowed. Riflescopes may also be used.', species: ['Deer'] }),
    reg('pa-ne', { title: 'Handgun Specifications for Deer Hunting', content: 'Any pistol or revolver with a barrel length of at least four inches and firing straight wall or other centerfire ammunition propelling an expanding-type bullet with a maximum diameter of no less than .350 of an inch and no larger than .500 of an inch and with a published or calculated muzzle energy of 500 foot pounds or higher is legal for hunti...', species: ['Deer'] }),
    reg('pa-ne', { title: 'Rifle Specifications for Deer Hunting', content: 'Rifles firing straight wall or other centerfire ammunition propelling an expanding-type bullet with a maximum diameter of no less than .350 of an inch and no larger than .500 of an inch and with a published or calculated muzzle energy of 500 foot pounds or higher is legal for hunting deer during the youth and disabled hunting season and first an...', species: ['Deer'] }),
    reg('pa-ne', { title: 'Crossbow Specifications', content: 'A crossbow consists of a bow mounted transversely on a stock or frame and designed to fire a bolt, arrow or quarrel by the release of the bow string, which is controlled by a mechanical trigger and working safety. Crossbows equipped with pistol grips and designed to be fired with one hand are illegal for taking or attempting to take deer or turk...', species: ['Deer', 'Wild Turkey'] }),
    reg('pa-ne', { title: 'Out of State Big Game Carcass Transportation', content: 'DNR regulations prohibit bringing back whole carcasses of deer, elk, moose or caribou into the state from areas where CWD has been identified. You may bring back only the boned out meat, skin (cape) and antlers. Antlers may be attached only to a clean skull plate from which all brain and connective tissue has been removed.', species: ['Deer', 'Elk', 'Moose', 'Caribou'] }),
    reg('pa-ne', { title: 'Mandatory Harvest Reporting', content: 'Hunters who harvest a deer or wild turkey must report the harvest to the DNR by midnight on the day after it is tagged, or before taking it to a locker or taxidermist, or before processing it for consumption, or before transporting it out-of-state, whichever occurs first. Hunters who harvest an antlered deer are required to report the length of ...', species: ['Deer', 'Wild Turkey'] }),
    reg('pa-ne', { title: 'Transportation Tag Requirements for Deer and Turkey', content: 'A Transportation Tag with the date of kill properly shown shall be visibly attached to the turkey immediately or the deer within 15 minutes of the time it is located after being taken or before the carcass is moved to be transported by any means, whichever occurs first, in a manner that the tag cannot be removed without mutilating or destroying ...', species: ['Deer', 'Wild Turkey'] }),
    reg('pa-ne', { title: 'Archery Equipment Specifications for Turkey Hunting', content: 'Longbows, recurve bows, and compound bows are permitted. No explosive or chemical devices may be attached to the arrow or broadhead. Blunthead arrows with a minimum diameter of 9/16-inch may also be used. Arrows must be at least 18 inches long.', species: ['Wild Turkey'] }),
    reg('pa-ne', { title: 'Shotgun Specifications for Turkey Hunting', content: '.410, and 28-gauge shotguns shooting shot sizes no smaller than 10 shot. 20-, 16-, 12- and 10-gauge or muzzleloading shotguns shooting shot size 10 through 4, lead or non-toxic. Muzzleloading rifles may not be used to hunt turkeys.', species: ['Wild Turkey'] }),
    reg('pa-ne', { title: 'Prohibited Devices and Activities for Turkey Hunting', content: 'You may not use live decoys, dogs (except in the fall), horses, phones, radios, motorized vehicles, aircraft, drones, bait, recorded or electronically amplified turkey calls or electronically amplified imitations of turkey calls or sounds when hunting turkeys.', species: ['Wild Turkey'] }),
    reg('pa-ne', { title: 'Hunting Shed Antlers', content: 'Shed antlers are antlers that have naturally fallen from a whitetail deer. Shed antlers can be collected on public land including state parks. Permission must be granted from the landowner on private land. Antlers that are still attached to the skull or any other parts of a deer can only be possessed with approval and tag from an Iowa DNR conser...', species: ['Deer'] }),
    reg('pa-ne', { title: 'Feral Hogs', content: 'Feral hogs are not native to Iowa and releasing pigs intentionally to hunt is illegal.', species: ['Feral Hog'] }),
    reg('pa-ne', { title: 'Dog Rabies Vaccination Requirement', content: 'Hunters bringing dogs six months of age or older into Iowa must have in their possession a health certificate verifying the rabies and other vaccinations of the dog(s).', species: [] }),
    reg('pa-ne', { title: 'Dog Training Requirements', content: 'Hunters need a valid Hunting License and have paid the Habitat Fee to train a bird dog on game birds. An Iowa Migratory Bird Fee and Federal Waterfowl Stamp are required if using waterfowl taken from the wild. A valid Furharvester License and Habitat Fee is required to train a coon hound, fox hound or trailing dog on any furbearing animals at an...', species: ['Coyote', 'Groundhog', 'Waterfowl'] }),
    reg('pa-ne', { title: 'Dog Restrictions on Game Management Areas', content: 'All dogs are prohibited on all state-owned game management areas between March 15 and July 15 of each year, except that dog training is permitted on designated training areas.', species: [] }),
    reg('mn-z2', { title: 'Hunter Education', content: 'Hunter education certification required for hunters born after December 31, 1979.', species: [] }),
    reg('mn-z2', { title: 'Bear Bait Site Registration', content: 'Bait sites must be registered with DNR and posted with hunter name and license number.', species: ['Bear'] }),
    reg('tx-south', { title: 'Public Hunting Permit', content: 'A Public Hunting Permit is required to hunt on TPWD wildlife management areas.', species: [] }),
    reg('sd-bh', { title: 'Hunter Safety', content: 'Hunters under 16 must be accompanied by a licensed adult.', species: [] }),
    reg('mt-d2', { title: 'Bear Identification Test', content: 'All black bear hunters must pass an online bear identification test before the season.', species: ['Bear'] }),
    reg('co-biggame', { title: 'License Requirements', content: 'Small-game licenses are not valid for turkeys. A turkey license is required to take wild turkey.', species: ['Turkey'] }),
    reg('co-biggame', { title: 'Harvest Information Program', content: 'Turkey hunters do not need to register with the Harvest Info. Program (HIP).', species: ['Turkey'] }),
    reg('co-biggame', { title: 'License Validity And Transferability', content: 'Licenses are valid for and expire after the season printed on them. Licenses are not transferable. It is illegal to make false statements when buying or altering a license.', species: [] }),
    reg('co-biggame', { title: 'Youth Licenses And Mentoring', content: 'All hunters, including those younger than 18, must meet hunter education requirements. Those under 16 hunting with a youth turkey license must also be accompanied by a mentor while hunting (18 or older, meets hunter education requirements). While hunting, youth and mentors mus...', species: ['Turkey'] }),
    reg('co-biggame', { title: 'Identification Requirements', content: 'Proper identification and proof of residency (for Colorado residents). A Social Security number or Individual Taxpayer Identification Number is required for hunters age 12 and older, per federal law.', species: [] }),
    reg('co-biggame', { title: 'Habitat Stamp', content: 'A 2026 ($12.76) or lifetime ($384.16) Habitat Stamp is required prior to buying a license for anyone ages 18–64.', species: [] }),
    reg('co-biggame', { title: 'Residency Requirements', content: 'The physical residence address must be the same as the address given for Colorado state income tax purposes. Colorado residency terminates if you apply for, buy or accept a resident hunting, fishing or trapping license from another state/country, register to vote outside CO, o...', species: [] }),
    reg('wy-bear', { title: 'Hunter Education Requirements', content: 'Anyone born on or after Jan. 1, 1949, must have a hunter education card to hunt in Colorado. Card is needed to apply for/buy a license. Card must be carried while hunting, unless verified and license marked with a "V." CPW honors cards from other states, provinces and countries.', species: [] }),
    reg('wy-bear', { title: 'Legal Hunting Hours', content: 'Legal hunting hours for turkey are one-half hour before sunrise to sunset.', species: ['Turkey'] }),
    reg('wy-bear', { title: 'Hunting Restrictions', content: 'Licenses not issued to those suspended for child support noncompliance. Certain crimes prohibit weapon possession.', species: [] }),
    reg('wy-bear', { title: 'Illegal Hunting Methods', content: 'Post public lands as private. Hunt on private land without landowner permission. Hunt on state trust lands (STLs) without permission (except those open for wildlife recreation). Loaded round in chamber of rifle/shotgun in/on a motor vehicle. Shoot from/use a motor vehicle to h...', species: [] }),
    reg('wy-bear', { title: 'Blinds And Tree Stands', content: 'Erect permanent blinds/tree stands on state wildlife areas (SWAs). Portable ones must be removed daily. Must show CID and dates of use.', species: [] }),
    reg('wy-bear', { title: 'Tagging Requirements', content: 'Detach, sign and date carcass tag immediately after harvest and attach to animal. Get duplicate from CPW office if tag is lost/destroyed.', species: [] }),
    reg('ny-bear-turkey', { title: 'Shotgun Specifications', content: 'Max 10-gauge; max 3 shells in magazine/chamber combined. Shot size #2 or smaller. Slugs illegal.', species: ['Turkey'] }),
    reg('ny-bear-turkey', { title: 'Rifle And Handgun Specifications', content: 'Muzzleloading, centerfire or rimfire; bullets min 17 grains; min 110 ft-lbs energy at 100 yards.', species: ['Turkey'] }),
    reg('ny-bear-turkey', { title: 'Air Gun Specifications', content: 'Precharged pneumatic .25 caliber or larger.', species: ['Turkey'] }),
    reg('ny-bear-turkey', { title: 'Evidence Of Sex', content: 'A turkey harvested in the spring must have its beard naturally attached while being transported. The beard is at the base of the turkey\'s neck.', species: ['Turkey'] }),
    reg('ny-bear-turkey', { title: 'Preference Points', content: 'Group applications are processed based on the member with the fewest points. If you don\'t apply for or purchase a license at least once in 10 consecutive years for turkey, your file is purged and your preference points are lost.', species: ['Turkey'] }),
    reg('ny-bear-turkey', { title: 'License Refunds', content: 'You must relinquish your license and carcass tag at least 14 days before opening day of the season for which the license is valid. A license cannot be recovered once it has been returned.', species: [] }),
    reg('ny-bear-turkey', { title: 'License Exchanges', content: 'No refunds or preference point restorations are available on exchanged licenses. Exchanges can be completed at a CPW office or park up until the day before the season starts on the original license. Once a season starts, an exchange is no longer available.', species: [] }),
    reg('tx-south', { title: 'Hunter Education Required', content: 'Hunters born after Sept 1, 1971 must complete an approved hunter education course.', species: [] }),
    reg('tx-south', { title: 'Harvest Reporting', content: 'Successful turkey hunters must record harvest in the My Texas Hunt Harvest mobile app within 24 hours.', species: ['Wild Turkey'] }),
    reg('tx-south', { title: 'Tag Requirements', content: 'A valid Hunting License with Turkey Stamp is required to hunt and tag turkeys.', species: ['Wild Turkey'] }),
    reg('tx-south', { title: 'No Drone Use', content: 'Use of drones to scout or pursue game is prohibited.', species: [] }),
    reg('tx-south', { title: 'Public Land Permit', content: 'A Public Hunting Permit is required to hunt on TPWD wildlife management areas.', species: [] }),
    reg('sd-bh', { title: 'Hunter Education', content: 'Hunters under 16 must complete a hunter education course or hunt under a mentor program.', species: [] }),
    reg('sd-bh', { title: 'Harvest Reporting', content: 'Successful hunters must report their harvest within 24 hours via the GFP portal.', species: ['Bear', 'Turkey'] }),
    reg('sd-bh', { title: 'Bear Bait Restrictions', content: 'Baiting is prohibited on Black Hills Forest Service lands.', species: ['Bear'] }),
    reg('sd-bh', { title: 'Fluorescent Orange', content: 'Hunters must wear at least one item of fluorescent orange visible from all sides during firearm seasons.', species: ['Bear'] }),
    reg('sd-bh', { title: 'Crossbow Permit', content: 'A separate crossbow permit is required for archery seasons.', species: ['Bear', 'Turkey'] }),
    reg('mt-d2', { title: 'Hunter Education', content: 'All hunters born after Jan 1, 1985 must complete a hunter education course.', species: [] }),
    reg('mt-d2', { title: 'Reporting Within 48 Hours', content: 'All harvested black bears must be reported within 48 hours.', species: ['Bear'] }),
    reg('mt-d2', { title: 'Hide and Skull Submission', content: 'Hide and skull must be presented to a check station within 10 days of harvest.', species: ['Bear'] }),
    reg('mt-d2', { title: 'No Trapping', content: 'Trapping black bear is prohibited; firearm and archery only.', species: ['Bear'] }),
    reg('mt-d2', { title: 'Sow with Cubs Protected', content: 'Taking a sow accompanied by cubs is prohibited.', species: ['Bear'] }),
  ];

  const RULES_PA = [
    rule('pa-ne', { species: 'Bear', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: 'One bear per year', huntCode: 'B-GEN-001', bagLimit: '1 bear', summary: 'One bear per license year, statewide' }),
    rule('pa-ne', { species: 'Bear', ruleType: 'Season Dates', seasonType: 'Archery', legalLabel: 'Archery bear', huntCode: 'B-ARC-101', startDate: '2026-10-18', endDate: '2026-11-01', weaponCategories: ['Archery', 'Crossbow'], summary: 'Archery bear: Oct 18 to Nov 1, 2026' }),
    rule('pa-ne', { species: 'Bear', ruleType: 'Season Dates', seasonType: 'Firearm', legalLabel: 'Firearm bear', huntCode: 'B-FIR-201', startDate: '2026-11-22', endDate: '2026-11-25', weaponCategories: ['Rifle', 'Shotgun'], summary: 'Firearm bear: Nov 22 to Nov 25, 2026' }),
    rule('pa-ne', { species: 'Bear', ruleType: 'Season Dates', seasonType: 'Muzzleloader', legalLabel: 'Muzzleloader bear', huntCode: 'B-MUZ-301', startDate: '2026-10-18', endDate: '2026-10-25', weaponCategories: ['Muzzleloader'], summary: 'Muzzleloader bear: Oct 18 to Oct 25, 2026' }),
    rule('pa-ne', { species: 'Bear', ruleType: 'Antler / Sex Restriction', seasonType: 'General', legalLabel: 'No cubs', sex: 'EITHER', summary: 'No cubs less than 50 lbs, no sows with cubs' }),
    rule('pa-ne', { species: 'Bear', ruleType: 'Method of Take', seasonType: 'General', legalLabel: 'No baiting', summary: 'Baiting prohibited statewide' }),
    rule('pa-ne', { species: 'Bear', ruleType: 'Hours of Take', seasonType: 'General', legalLabel: 'Daylight only', summary: 'One half hour before sunrise to one half hour after sunset' }),
    rule('pa-ne', { species: 'Bear', ruleType: 'License Required', seasonType: 'General', legalLabel: 'Bear license', summary: 'Bear license tag required in addition to general license' }),
    rule('pa-ne', { species: 'Turkey', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: 'Two bearded', sex: 'MALE', bagLimit: '2 bearded turkeys, 1 per day', summary: 'Two bearded turkeys, only one per day' }),
    rule('pa-ne', { species: 'Turkey', ruleType: 'Season Dates', seasonType: 'General', legalLabel: 'Spring gobbler', huntCode: 'T-SPR-101', sex: 'MALE', startDate: '2026-05-02', endDate: '2026-05-30', summary: 'Spring gobbler: May 2 to May 30, 2026' }),
    rule('pa-ne', { species: 'Turkey', ruleType: 'Season Dates', seasonType: 'General', legalLabel: 'Fall turkey', huntCode: 'T-FAL-201', startDate: '2026-10-31', endDate: '2026-11-13', summary: 'Fall turkey: Oct 31 to Nov 13, 2026' }),
    rule('pa-ne', { species: 'Turkey', ruleType: 'Weapon Restriction', seasonType: 'Archery', legalLabel: 'Archery legal', weaponCategories: ['Archery', 'Crossbow'], summary: 'Archery and crossbow legal during all turkey seasons' }),
    rule('pa-ne', { species: 'Turkey', ruleType: 'Weapon Restriction', seasonType: 'Firearm', legalLabel: 'Shot size 4 to 8', weaponCategories: ['Shotgun'], summary: 'Shotgun shot size 4 to 8, no rifled slugs' }),
    rule('pa-ne', { species: 'Turkey', ruleType: 'Method of Take', seasonType: 'General', legalLabel: 'No dogs in spring', summary: 'Use of dogs prohibited in spring season' }),
    rule('pa-ne', { species: 'Turkey', ruleType: 'Hours of Take', seasonType: 'General', legalLabel: 'Half day spring', summary: 'One half hour before sunrise until 12:00 PM during spring season' }),
  ];

  const RULES_MN = [
    rule('mn-z2', { species: 'Rabbit', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: '', huntCode: '', sex: 'EITHER', bagLimit: '8 per day', startDate: '2025-09-01', endDate: '2026-02-28', summary: 'September 1, 2025 - February 28, 2026' }),
    rule('mn-z2', { species: 'Teal', ruleType: 'Season Dates', seasonType: 'General', legalLabel: '', huntCode: '', sex: 'EITHER', bagLimit: '', startDate: '2025-09-20', endDate: '2025-09-28', summary: 'September 20-28, 2025' }),
    rule('mn-z2', { species: 'Feral Hog', ruleType: 'Season Dates', seasonType: 'General', legalLabel: '', huntCode: '', sex: 'EITHER', bagLimit: '', startDate: '', endDate: '', summary: 'Year-round' }),
    rule('mn-z2', { species: 'Alligator', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: 'Quota', huntCode: '', sex: 'EITHER', bagLimit: '', startDate: '2025-09-19', endDate: '2025-09-29', summary: 'Quota · Sep 19 - 22, 2025 Sep 26 - 29, 2025' }),
    rule('mn-z2', { species: 'Alligator', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: 'Quota', huntCode: '', sex: 'EITHER', bagLimit: '', startDate: '2025-09-19', endDate: '2025-09-29', summary: 'Quota · Sep 19 - 22, 2025 Sep 26 - 29, 2025' }),
    rule('mn-z2', { species: 'Alligator', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: 'Quota', huntCode: '', sex: 'EITHER', bagLimit: '', startDate: '2025-09-19', endDate: '2025-09-29', summary: 'Quota · Sep 19 - 22, 2025 Sep 26 - 29, 2025' }),
    rule('mn-z2', { species: 'American Woodcock', ruleType: 'Season Dates', seasonType: 'General', legalLabel: '', huntCode: '', sex: 'EITHER', bagLimit: '', startDate: '2025-11-01', endDate: '2025-12-15', summary: 'November 1 - December 15, 2025' }),
    rule('mn-z2', { species: 'Elk', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: '', huntCode: '', sex: 'EITHER', bagLimit: '', startDate: '', endDate: '', summary: 'During deer season' }),
    rule('mn-z2', { species: 'Feral Hog', ruleType: 'Season Dates', seasonType: 'General', legalLabel: '', huntCode: '', sex: 'EITHER', bagLimit: '', startDate: '2025-09-06', endDate: '2026-02-28', summary: 'During open bear' }),
    rule('mn-z2', { species: 'Feral Hog', ruleType: 'Season Dates', seasonType: 'General', legalLabel: '', huntCode: '', sex: 'EITHER', bagLimit: '', startDate: '2025-09-06', endDate: '2026-02-28', summary: 'deer or elk seasons' }),
    rule('mn-z2', { species: 'Coyote', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: '', huntCode: '', sex: 'EITHER', bagLimit: 'None', startDate: '', endDate: '', summary: 'July 1, 2025 - February 28, 2026' }),
    rule('mn-z2', { species: 'Coyote', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: '', huntCode: '', sex: 'EITHER', bagLimit: 'None', startDate: '', endDate: '', summary: 'January 1 - December 31, 2025' }),
    rule('mn-z2', { species: 'River Otter', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: '', huntCode: '', sex: 'EITHER', bagLimit: 'None', startDate: '2025-11-08', endDate: '2026-02-28', summary: 'November 8, 2025 - February 28, 2026' }),
    rule('mn-z2', { species: 'Alligator', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: '', huntCode: '', sex: 'EITHER', bagLimit: '', startDate: '2025-09-19', endDate: '2025-09-29', summary: 'Sept 19-22 and Sept 26-29, 2025' }),
    rule('mn-z2', { species: 'Quail', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: '', huntCode: '', sex: 'EITHER', bagLimit: '4', startDate: '2025-12-01', endDate: '2025-12-31', summary: 'December 1-31, 2025' }),
    rule('mn-z2', { species: 'Quail', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: '', huntCode: '', sex: 'EITHER', bagLimit: '4', startDate: '2025-12-01', endDate: '2025-12-31', summary: 'December 1-31, 2025' }),
    rule('mn-z2', { species: 'Quail', ruleType: 'Season Dates', seasonType: 'General', legalLabel: '', huntCode: '', sex: 'EITHER', bagLimit: '', startDate: '2025-12-01', endDate: '2026-02-01', summary: 'December 1, 2025 - February 1, 2026' }),
    rule('mn-z2', { species: 'Quail', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: '', huntCode: '', sex: 'EITHER', bagLimit: '6', startDate: '2025-11-01', endDate: '2026-02-01', summary: 'November 1, 2025 - February 1, 2026' }),
    rule('mn-z2', { species: 'Deer', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: 'Any Deer', huntCode: '', sex: 'EITHER', bagLimit: '2 antlered bucks', startDate: '2025-10-18', endDate: '2025-10-30', summary: 'Any Deer · As set by Army Corps of Engineers' }),
    rule('mn-z2', { species: 'Deer', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: 'Any Deer', huntCode: '', sex: 'EITHER', bagLimit: '1 antlered buck', startDate: '2025-10-18', endDate: '2025-10-19', summary: 'Any Deer · October 18-19, 2025' }),
    rule('mn-z2', { species: 'Deer', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: 'Any Deer', huntCode: '', sex: 'EITHER', bagLimit: '2 antlered bucks', startDate: '2025-10-18', endDate: '2025-10-19', summary: 'Any Deer · October 18-19, 2025' }),
    rule('mn-z2', { species: 'Deer', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: 'Any Deer', huntCode: '', sex: 'EITHER', bagLimit: '1 antlered buck', startDate: '2025-10-29', endDate: '2025-10-30', summary: 'Any Deer · October 29-30, 2025' }),
    rule('mn-z2', { species: 'Deer', ruleType: 'Bag Limit', seasonType: 'Firearm', legalLabel: 'Any Deer', huntCode: '', sex: 'EITHER', bagLimit: '1 buck', startDate: '2025-10-30', endDate: '2025-10-31', summary: 'Any Deer · October 30-31, 2025' }),
    rule('mn-z2', { species: 'Elk', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: '', huntCode: '', sex: 'EITHER', bagLimit: '', startDate: '2025-10-04', endDate: '2025-10-26', summary: 'Oct 4 - Oct 5, 2025 Oct 25 - Oct 26, 2025' }),
    rule('mn-z2', { species: 'Bear', ruleType: 'Bag Limit', seasonType: 'Firearm', legalLabel: '', huntCode: '', sex: 'EITHER', bagLimit: '', startDate: '2025-10-18', endDate: '2025-10-26', summary: 'October 18-26, 2025' }),
    rule('mn-z2', { species: 'Bear', ruleType: 'Bag Limit', seasonType: 'Firearm', legalLabel: '', huntCode: '', sex: 'EITHER', bagLimit: '', startDate: '2025-10-18', endDate: '2025-10-26', summary: 'October 18-26, 2025' }),
    rule('mn-z2', { species: 'Bear', ruleType: 'Bag Limit', seasonType: 'Firearm', legalLabel: '', huntCode: '', sex: 'EITHER', bagLimit: '', startDate: '2025-10-18', endDate: '2025-10-26', summary: 'October 18-26, 2025' }),
    rule('mn-z2', { species: 'Bear', ruleType: 'Bag Limit', seasonType: 'Firearm', legalLabel: '', huntCode: '', sex: 'EITHER', bagLimit: '', startDate: '2025-10-18', endDate: '2025-10-22', summary: 'October 18-22, 2025' }),
    rule('mn-z2', { species: 'Bear', ruleType: 'Bag Limit', seasonType: 'Firearm', legalLabel: '', huntCode: '', sex: 'EITHER', bagLimit: '', startDate: '2025-10-18', endDate: '2025-10-22', summary: 'October 18-22, 2025' }),
    rule('mn-z2', { species: 'Bear', ruleType: 'Bag Limit', seasonType: 'Firearm', legalLabel: '', huntCode: '', sex: 'EITHER', bagLimit: '', startDate: '2025-10-18', endDate: '2025-10-22', summary: 'October 18-22, 2025' }),
    rule('mn-z2', { species: 'Bear', ruleType: 'Bag Limit', seasonType: 'Firearm', legalLabel: '', huntCode: '', sex: 'EITHER', bagLimit: '', startDate: '2025-10-11', endDate: '2025-10-15', summary: 'October 11-15, 2025' }),
    rule('mn-z2', { species: 'Deer', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: '', huntCode: '', sex: 'EITHER', bagLimit: '2', startDate: '2025-10-29', endDate: '2025-10-30', summary: 'October 29-30, 2025' }),
    rule('mn-z2', { species: 'Deer', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: 'Any Buck', huntCode: '', sex: 'EITHER', bagLimit: '5', startDate: '2025-11-09', endDate: '2025-11-10', summary: 'Any Buck · November 9-10, 2025' }),
    rule('mn-z2', { species: 'Deer', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: 'Any Buck', huntCode: '', sex: 'EITHER', bagLimit: '5', startDate: '2025-11-08', endDate: '2025-11-09', summary: 'Any Buck · November 8-9, 2025' }),
    rule('mn-z2', { species: 'Crow', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: '', huntCode: '', sex: 'EITHER', bagLimit: 'None', startDate: '2025-09-04', endDate: '2026-02-21', summary: 'September 4, 2025 - February 21, 2026' }),
    rule('mn-z2', { species: 'Crow', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: '', huntCode: '', sex: 'EITHER', bagLimit: 'None', startDate: '2025-09-01', endDate: '2026-02-21', summary: 'September 1, 2025 - February 21, 2026' }),
    rule('mn-z2', { species: 'Bobcat', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: '', huntCode: '', sex: 'EITHER', bagLimit: '2 per day', startDate: '2025-09-01', endDate: '2026-02-28', summary: 'September 1, 2025 - February 28, 2026' }),
    rule('mn-z2', { species: 'Bobcat', ruleType: 'Season Dates', seasonType: 'General', legalLabel: '', huntCode: '', sex: 'EITHER', bagLimit: '', startDate: '2025-09-01', endDate: '2026-02-28', summary: 'September 1, 2025 - February 28, 2026' }),
    rule('mn-z2', { species: 'Bobcat', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: '', huntCode: '', sex: 'EITHER', bagLimit: '2 per day', startDate: '2025-09-01', endDate: '2026-02-28', summary: 'September 1, 2025 - February 28, 2026' }),
    rule('mn-z2', { species: 'Bobcat', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: '', huntCode: '', sex: 'EITHER', bagLimit: '2 per day', startDate: '2025-09-01', endDate: '2026-02-28', summary: 'September 1, 2025 - February 28, 2026' }),
    rule('mn-z2', { species: 'Bobcat', ruleType: 'Season Dates', seasonType: 'General', legalLabel: '', huntCode: '', sex: 'EITHER', bagLimit: '', startDate: '2025-09-01', endDate: '2026-02-28', summary: 'September 1, 2025 - February 28, 2026' }),
    rule('mn-z2', { species: 'Wild Turkey', ruleType: 'Bag Limit', seasonType: 'Firearm', legalLabel: 'Adult Gobbler', huntCode: '', sex: 'MALE', bagLimit: '1 legal turkey', startDate: '2026-04-20', endDate: '2026-05-10', summary: 'Adult Gobbler · April 20 - May 10, 2026' }),
    rule('mn-z2', { species: 'Wild Turkey', ruleType: 'Bag Limit', seasonType: 'Firearm', legalLabel: 'Adult Gobbler', huntCode: '', sex: 'MALE', bagLimit: '1 per day', startDate: '2026-04-20', endDate: '2026-05-10', summary: 'Adult Gobbler · April 20 - May 10, 2026' }),
    rule('mn-z2', { species: 'Wild Turkey', ruleType: 'Bag Limit', seasonType: 'Firearm', legalLabel: 'Adult Gobbler', huntCode: '', sex: 'MALE', bagLimit: '1 legal turkey', startDate: '2026-04-13', endDate: '2026-05-03', summary: 'Adult Gobbler · April 13 - May 3, 2026' }),
    rule('mn-z2', { species: 'Wild Turkey', ruleType: 'Bag Limit', seasonType: 'Firearm', legalLabel: 'Adult Gobbler', huntCode: '', sex: 'MALE', bagLimit: '1 per day', startDate: '2026-04-13', endDate: '2026-05-03', summary: 'Adult Gobbler · April 13 - May 3, 2026' }),
    rule('mn-z2', { species: 'Wild Turkey', ruleType: 'Bag Limit', seasonType: 'Firearm', legalLabel: 'Adult Gobbler', huntCode: '', sex: 'MALE', bagLimit: '1 legal turkey', startDate: '2026-04-20', endDate: '2026-04-28', summary: 'Adult Gobbler · April 20-28, 2026' }),
    rule('mn-z2', { species: 'Wild Turkey', ruleType: 'Bag Limit', seasonType: 'Firearm', legalLabel: 'Adult Gobbler', huntCode: '', sex: 'MALE', bagLimit: '1 per day', startDate: '2026-04-20', endDate: '2026-04-28', summary: 'Adult Gobbler · April 20-28, 2026' }),
    rule('mn-z2', { species: 'Wild Turkey', ruleType: 'Bag Limit', seasonType: 'Firearm', legalLabel: 'Adult Gobbler', huntCode: '', sex: 'MALE', bagLimit: '1 legal turkey', startDate: '2026-04-06', endDate: '2026-05-10', summary: 'Adult Gobbler · Apr 20 - Apr 22, 2026 Apr 25 - Apr 27, 2026 Apr May 2 - May 4, 2026' }),
    rule('mn-z2', { species: 'Wild Turkey', ruleType: 'Bag Limit', seasonType: 'Firearm', legalLabel: 'Adult Gobbler', huntCode: '', sex: 'MALE', bagLimit: '1 legal turkey', startDate: '2026-04-06', endDate: '2026-05-10', summary: 'Adult Gobbler · Apr 20 - Apr 22, 2026 Apr 25 - Apr 27, 2026' }),
    rule('mn-z2', { species: 'Wild Turkey', ruleType: 'Bag Limit', seasonType: 'Firearm', legalLabel: 'Adult Gobbler', huntCode: '', sex: 'MALE', bagLimit: '1 legal turkey', startDate: '2026-04-06', endDate: '2026-05-10', summary: 'Adult Gobbler · Apr 13 - Apr 15, 2026 Apr 18 - Apr 20, 2026 Apr 25 - Apr 27, 2026' }),
  ];

  const RULES_TX = [
    rule('tx-south', { species: 'Turkey', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: 'Four gobblers', sex: 'MALE', bagLimit: '4 gobblers', summary: 'Four turkey gobblers per fall season' }),
    rule('tx-south', { species: 'Turkey', ruleType: 'Season Dates', seasonType: 'General', legalLabel: 'Fall turkey TX', huntCode: 'T-FAL-TX1', startDate: '2026-11-01', endDate: '2027-01-04', summary: 'Fall turkey: Nov 1 to Jan 4, 2027' }),
  ];

  const RULES_SD = [
    rule('sd-bh', { species: 'Bear', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: 'One black bear', bagLimit: '1 bear', summary: 'One black bear per license year' }),
    rule('sd-bh', { species: 'Turkey', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: 'One bearded', sex: 'MALE', bagLimit: '1 bearded', summary: 'One bearded turkey, additional units by tag' }),
  ];

  const RULES_MT = [
    rule('mt-d2', { species: 'Bear', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: 'One black bear', bagLimit: '1 bear', summary: 'One black bear per license year' }),
    rule('mt-d2', { species: 'Bear', ruleType: 'Season Dates', seasonType: 'General', legalLabel: 'Spring bear', huntCode: 'B-SPR-MT2', startDate: '2026-04-15', endDate: '2026-06-15', summary: 'Spring bear: Apr 15 to Jun 15, 2026' }),
  ];


  const RULES_LIGHT = [
    rule('co-biggame', { species: 'Bear', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: 'One bear per year', huntCode: 'CO-B-001', sex: 'EITHER', bagLimit: '1 bear', summary: 'One black bear per license year' }),
    rule('co-biggame', { species: 'Bear', ruleType: 'Season Dates', seasonType: 'Archery', legalLabel: 'Archery bear', huntCode: 'CO-B-ARC', startDate: '2026-09-02', endDate: '2026-09-30', weaponCategories: ['Archery', 'Crossbow'], summary: 'Archery bear: Sep 2 to Sep 30, 2026' }),
    rule('co-biggame', { species: 'Bear', ruleType: 'Season Dates', seasonType: 'Firearm', legalLabel: 'Firearm bear', huntCode: 'CO-B-FIR', startDate: '2026-09-02', endDate: '2026-11-30', weaponCategories: ['Rifle'], summary: 'Firearm bear: Sep 2 to Nov 30, 2026' }),
    rule('co-biggame', { species: 'Elk', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: 'One elk per year', huntCode: 'CO-E-001', sex: 'EITHER', bagLimit: '1 elk', summary: 'One elk per license year, antler restriction varies by unit' }),
    rule('co-biggame', { species: 'Elk', ruleType: 'Season Dates', seasonType: 'Archery', legalLabel: 'Archery elk', huntCode: 'CO-E-ARC', startDate: '2026-08-29', endDate: '2026-09-27', summary: 'Archery elk: Aug 29 to Sep 27, 2026' }),
    rule('co-biggame', { species: 'Elk', ruleType: 'Season Dates', seasonType: 'Firearm', legalLabel: '1st rifle elk', huntCode: 'CO-E-RF1', startDate: '2026-10-10', endDate: '2026-10-14', summary: '1st rifle elk: Oct 10 to Oct 14, 2026' }),
    rule('co-biggame', { species: 'Bear', ruleType: 'Method of Take', seasonType: 'General', legalLabel: 'No baiting', summary: 'Baiting prohibited; spot and stalk only' }),
    rule('wy-bear', { species: 'Bear', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: 'One black bear', huntCode: 'WY-B-001', sex: 'EITHER', bagLimit: '1 bear', summary: 'One black bear per license year' }),
    rule('wy-bear', { species: 'Bear', ruleType: 'Season Dates', seasonType: 'General', legalLabel: 'Spring bear', huntCode: 'WY-B-SPR', startDate: '2026-04-15', endDate: '2026-06-30', summary: 'Spring bear: Apr 15 to Jun 30, 2026' }),
    rule('wy-bear', { species: 'Bear', ruleType: 'Season Dates', seasonType: 'General', legalLabel: 'Fall bear', huntCode: 'WY-B-FAL', startDate: '2026-09-01', endDate: '2026-10-31', summary: 'Fall bear: Sep 1 to Oct 31, 2026' }),
    rule('wy-bear', { species: 'Bear', ruleType: 'Antler / Sex Restriction', seasonType: 'General', legalLabel: 'Sow with cubs protected', sex: 'EITHER', summary: 'Taking a sow with cubs of the year is unlawful' }),
    rule('wy-bear', { species: 'Bear', ruleType: 'Method of Take', seasonType: 'General', legalLabel: 'Baiting allowed', summary: 'Baiting permitted with restrictions on container size and placement' }),
    rule('ny-bear-turkey', { species: 'Bear', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: 'One bear per year', huntCode: 'NY-B-001', sex: 'EITHER', bagLimit: '1 bear', summary: 'One black bear per license year' }),
    rule('ny-bear-turkey', { species: 'Bear', ruleType: 'Season Dates', seasonType: 'Archery', legalLabel: 'Archery bear', huntCode: 'NY-B-ARC', startDate: '2026-09-27', endDate: '2026-10-18', weaponCategories: ['Archery'], summary: 'Archery bear: Sep 27 to Oct 18, 2026' }),
    rule('ny-bear-turkey', { species: 'Bear', ruleType: 'Season Dates', seasonType: 'Firearm', legalLabel: 'Firearm bear', huntCode: 'NY-B-FIR', startDate: '2026-11-21', endDate: '2026-12-13', weaponCategories: ['Rifle', 'Shotgun'], summary: 'Firearm bear: Nov 21 to Dec 13, 2026' }),
    rule('ny-bear-turkey', { species: 'Turkey', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: 'Two bearded', sex: 'MALE', bagLimit: '2 bearded turkeys', summary: 'Two bearded turkeys per spring season' }),
    rule('ny-bear-turkey', { species: 'Turkey', ruleType: 'Season Dates', seasonType: 'General', legalLabel: 'Spring turkey', huntCode: 'NY-T-SPR', sex: 'MALE', startDate: '2026-05-01', endDate: '2026-05-31', summary: 'Spring turkey: May 1 to May 31, 2026' }),
    rule('ny-bear-turkey', { species: 'Turkey', ruleType: 'Season Dates', seasonType: 'General', legalLabel: 'Fall turkey', huntCode: 'NY-T-FAL', startDate: '2026-10-01', endDate: '2026-10-14', summary: 'Fall turkey: Oct 1 to Oct 14, 2026' }),
    rule('ny-bear-turkey', { species: 'Turkey', ruleType: 'Hours of Take', seasonType: 'General', legalLabel: 'Half day spring', summary: 'One half hour before sunrise to noon during spring season' }),
    rule('tx-south', { species: 'Wild Turkey', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: 'Spring gobbler', sex: 'MALE', bagLimit: '4 gobblers', summary: 'Four bearded turkeys per spring season' }),
    rule('tx-south', { species: 'Wild Turkey', ruleType: 'Season Dates', seasonType: 'Archery', legalLabel: 'Archery spring', huntCode: 'TX-T-ARC', startDate: '2026-04-01', endDate: '2026-04-13', summary: 'Archery spring turkey: Apr 1 to Apr 13, 2026' }),
    rule('tx-south', { species: 'Wild Turkey', ruleType: 'Method of Take', seasonType: 'General', legalLabel: 'Calls allowed', summary: 'Decoys and calls permitted; no electronic calls' }),
    rule('sd-bh', { species: 'Bear', ruleType: 'Season Dates', seasonType: 'General', legalLabel: 'Bear season', huntCode: 'SD-B-001', startDate: '2026-09-01', endDate: '2026-10-31', summary: 'Black bear: Sep 1 to Oct 31, 2026' }),
    rule('sd-bh', { species: 'Turkey', ruleType: 'Season Dates', seasonType: 'General', legalLabel: 'Spring turkey', huntCode: 'SD-T-SPR', sex: 'MALE', startDate: '2026-04-11', endDate: '2026-05-17', summary: 'Spring turkey: Apr 11 to May 17, 2026' }),
    rule('sd-bh', { species: 'Bear', ruleType: 'License Required', seasonType: 'General', legalLabel: 'Black Hills bear tag', summary: 'Black Hills bear tag required, drawn through annual lottery' }),
    rule('sd-bh', { species: 'Turkey', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: 'One per unit', sex: 'MALE', bagLimit: '1 per unit', summary: 'One bearded turkey per unit, multiple units possible' }),
    rule('mt-d2', { species: 'Bear', ruleType: 'Season Dates', seasonType: 'General', legalLabel: 'Fall bear', huntCode: 'MT-B-FAL', startDate: '2026-09-15', endDate: '2026-11-30', summary: 'Fall bear: Sep 15 to Nov 30, 2026' }),
    rule('mt-d2', { species: 'Bear', ruleType: 'Hours of Take', seasonType: 'General', legalLabel: 'Daylight only', summary: 'One half hour before sunrise to one half hour after sunset' }),
    rule('mt-d2', { species: 'Bear', ruleType: 'Reporting', seasonType: 'General', legalLabel: 'Mandatory check-in', summary: 'Successful hunters must report harvest within 48 hours' }),
  ];

  const ALL_RULES = [...RULES_PA, ...RULES_MN, ...RULES_TX, ...RULES_SD, ...RULES_MT, ...RULES_LIGHT];
  const ALL_REGS = REGULATIONS;

  // Dynamically populate manager.species from actual rules + regs (overrides any hardcoded value).
  MANAGERS.forEach(m => {
    const set = new Set();
    ALL_RULES.filter(r => r.managerId === m.id).forEach(r => { if (r.species) set.add(r.species); });
    ALL_REGS.filter(g => g.managerId === m.id).forEach(g => (g.species || []).forEach(sp => set.add(sp)));
    if (set.size > 0) m.species = Array.from(set).sort();
  });


  let feeCounter = 1;
  const fee = (managerId, licenseId, hunterType, amount) => ({
    id: 'lf-' + String(feeCounter++).padStart(4, '0'),
    managerId, licenseId, hunterType, fee: amount, currency: 'USD',
  });

  const LICENSE_FEES = [
    fee('pa-ne', 'lic-pa-gen', 'resident', 20.97),
    fee('pa-ne', 'lic-pa-gen', 'non_resident', 101.97),
    fee('pa-ne', 'lic-pa-bear', 'resident', 16.97),
    fee('pa-ne', 'lic-pa-bear', 'non_resident', 36.97),
    fee('pa-ne', 'lic-pa-turkey', 'resident', 11.97),
    fee('pa-ne', 'lic-pa-turkey', 'non_resident', 21.97),
    fee('pa-ne', 'lic-pa-arch', 'resident', 16.97),
    fee('mn-z2', 'lic-mn-bear', 'resident', 44.00),
    fee('mn-z2', 'lic-mn-bear', 'non_resident', 230.00),
    fee('mn-z2', 'lic-mn-turkey', 'resident', 26.00),
    fee('tx-south', 'lic-tx-turkey', 'resident', 7.00),
    fee('sd-bh', 'lic-sd-bear', 'resident', 30.00),
  ];

  const SAMPLE_INPUT_JSON = `{
  "manager": "Northeast Region",
  "state": "PA",
  "extracted_at": "2026-05-05T10:14:22Z",
  "model": "gemini-2.0-pro",
  "rules": [
    {"species": "Bear", "type": "Bag Limit", "summary": "One bear per license year, statewide"},
    {"species": "Bear", "type": "Season Dates", "summary": "Archery bear: Oct 18 to Nov 1, 2026"},
    {"species": "Bear", "type": "Season Dates", "summary": "Firearm bear: Nov 22 to Nov 25, 2026"},
    {"species": "Bear", "type": "Method of Take", "summary": "Baiting prohibited statewide"},
    {"species": "Bear", "type": "Hours of Take", "summary": "One half hour before sunrise to one half hour after sunset"},
    {"species": "Bear", "type": "License Required", "summary": "Bear license tag required in addition to general license"},
    {"species": "Bear", "type": "Hide Submission", "summary": "Hide and skull surrender required at check station"},
    {"species": "Bear", "type": "Drone Use", "summary": "Drones permitted for scouting up to 48 hours pre-season"}
  ]
}`;

  const SAMPLE_REPORT = {
    id: 'vrun-pa-ne-12',
    managerId: 'pa-ne',
    referenceLabel: 'PA Bear & Turkey · ground truth',
    candidateLabel: 'extraction-2026-05-05.json',
    inputFormat: 'json',
    inputPreview: SAMPLE_INPUT_JSON,
    scope: {
      label: 'Bear rules only',
      species: ['Bear'],
      regulationCount: 24,
      ruleCount: 12,
    },
    ranAt: '2026-05-05T14:32:00Z',
    ranBy: 'jim@onx',
    score: 0.55,
    phases: [
      {
        name: 'count_and_match',
        label: 'Count and match',
        status: 'completed',
        durationMs: 84,
        summary: 'Matched 8 by direct name, 4 leftovers passed to reconciliation',
        kind: 'deterministic',
      },
      {
        name: 'reconcile_names',
        label: 'Reconcile names',
        status: 'completed',
        durationMs: 3120,
        summary: 'LLM resolved 2 typos / alt-names; 2 remained unresolved (added to extra)',
        kind: 'llm',
      },
      {
        name: 'field_and_report',
        label: 'Field and report',
        status: 'completed',
        durationMs: 47,
        summary: '10 correct, 2 missing, 2 extra; final accuracy 55%',
        kind: 'deterministic',
      },
    ],
    buckets: {
      correct: [
        { id: 'r-0001', species: 'Bear', ruleType: 'Bag Limit', seasonType: 'General', legalLabel: 'One bear per year', huntCode: 'B-GEN-001', summary: 'One bear per license year, statewide' },
        { id: 'r-0002', species: 'Bear', ruleType: 'Season Dates', seasonType: 'Archery', legalLabel: 'Archery bear', huntCode: 'B-ARC-101', summary: 'Archery bear: Oct 18 to Nov 1, 2026' },
        { id: 'r-0003', species: 'Bear', ruleType: 'Season Dates', seasonType: 'Firearm', legalLabel: 'Firearm bear', huntCode: 'B-FIR-201', summary: 'Firearm bear: Nov 22 to Nov 25, 2026' },
        { id: 'r-0006', species: 'Bear', ruleType: 'Method of Take', seasonType: 'General', legalLabel: 'No baiting', summary: 'Baiting prohibited statewide' },
        { id: 'r-0007', species: 'Bear', ruleType: 'Hours of Take', seasonType: 'General', legalLabel: 'Daylight only', summary: 'One half hour before sunrise to one half hour after sunset' },
        { id: 'r-0008', species: 'Bear', ruleType: 'License Required', seasonType: 'General', legalLabel: 'Bear license', summary: 'Bear license tag required in addition to general license' },
      ],
      missing: [
        { id: 'r-0004', species: 'Bear', ruleType: 'Season Dates', seasonType: 'Muzzleloader', legalLabel: 'Muzzleloader bear', huntCode: 'B-MUZ-301', summary: 'Muzzleloader bear: Oct 18 to Oct 25, 2026' },
        { id: 'r-0005', species: 'Bear', ruleType: 'Antler / Sex Restriction', seasonType: 'General', legalLabel: 'No cubs', summary: 'No cubs less than 50 lbs, no sows with cubs' },
      ],
      extra: [
        { id: 'x-001', species: 'Bear', ruleType: 'Hide Submission', seasonType: 'General', legalLabel: 'Hide check', summary: 'Hide and skull surrender required at check station' },
        { id: 'x-002', species: 'Bear', ruleType: 'Drone Use', seasonType: 'General', legalLabel: 'Drone scouting', summary: 'Drones permitted for scouting up to 48 hours pre-season' },
      ],
    },
    regulationsBuckets: {
      correct: [
        { id: 'g-0001', title: 'Hunter Education Required', content: 'All first time license buyers must complete a hunter education course before purchasing a hunting license.', species: [] },
        { id: 'g-0002', title: 'Harvest Reporting', content: 'Successful hunters must report their harvest within 24 hours via the PGC online portal or by phone.', species: ['Bear', 'Turkey'] },
        { id: 'g-0003', title: 'Tag Carriage', content: 'Hunters must carry their bear or turkey tag with them at all times during the season.', species: ['Bear', 'Turkey'] },
      ],
      missing: [
        { id: 'g-0004', title: 'Sunday Hunting', content: 'Sunday hunting is permitted on three Sundays only: November 16, November 23, and November 30, 2026.', species: [] },
        { id: 'g-0005', title: 'Fluorescent Orange', content: '250 sq inches of fluorescent orange required during firearm bear and big game seasons.', species: ['Bear'] },
      ],
      extra: [
        { id: 'gx-001', title: 'Mandatory Field Reporting', content: 'All hunters required to report kill site GPS coordinates within 12 hours.', species: ['Bear'] },
      ],
    },
  };

  const HISTORY = [
    { id: 'rep-pa-ne-1',  managerId: 'pa-ne', ranAt: '2026-02-10', score: 0.62, correct: 7, missing: 5, extra: 4, scope: 'Bear rules only', ranBy: 'rafael@onx' },
    { id: 'rep-pa-ne-3',  managerId: 'pa-ne', ranAt: '2026-02-28', score: 0.69, correct: 8, missing: 4, extra: 3, scope: 'Bear rules only', ranBy: 'jonathan@onx' },
    { id: 'rep-pa-ne-5',  managerId: 'pa-ne', ranAt: '2026-03-14', score: 0.74, correct: 9, missing: 3, extra: 3, scope: 'Bear rules only', ranBy: 'jim@onx' },
    { id: 'rep-pa-ne-7',  managerId: 'pa-ne', ranAt: '2026-03-29', score: 0.81, correct: 9, missing: 2, extra: 2, scope: 'Bear rules only', ranBy: 'jim@onx' },
    { id: 'rep-pa-ne-9',  managerId: 'pa-ne', ranAt: '2026-04-12', score: 0.85, correct: 10, missing: 1, extra: 2, scope: 'Bear + Turkey', ranBy: 'rafael@onx' },
    { id: 'rep-pa-ne-11', managerId: 'pa-ne', ranAt: '2026-04-26', score: 0.91, correct: 10, missing: 1, extra: 1, scope: 'Bear rules only', ranBy: 'jonathan@onx' },
    { id: 'rep-pa-ne-12', managerId: 'pa-ne', ranAt: '2026-05-05', score: 0.55, correct: 6, missing: 2, extra: 2, scope: 'Bear rules only', ranBy: 'jim@onx' },
  ];

  return {
    STATES,
    SPECIES,
    SEASON_TYPES,
    RULE_TYPES,
    SEX_TYPES,
    WEAPON_CATEGORIES,
    HUNTER_TYPES,
    CURRENCIES,
    LICENSES,
    ELIGIBILITY_CATEGORIES,
    WEAPON_SPECS_SCHEMA,
    MANAGERS,
    RULES: ALL_RULES,
    REGULATIONS: ALL_REGS,
    LICENSE_FEES,
    SAMPLE_REPORT,
    SAMPLE_INPUT_JSON,
    HISTORY,
    speciesForManager(managerId) {
      const m = MANAGERS.find(mm => mm.id === managerId);
      return m ? (m.species || []) : [];
    },
    allSpecies() {
      const set = new Set();
      MANAGERS.forEach(m => (m.species || []).forEach(sp => set.add(sp)));
      return Array.from(set).sort();
    },
    rulesForManager(managerId) {
      return ALL_RULES.filter(r => r.managerId === managerId);
    },
    regulationsForManager(managerId) {
      return ALL_REGS.filter(g => g.managerId === managerId);
    },
    licenseFeesForManager(managerId) {
      return LICENSE_FEES.filter(f => f.managerId === managerId);
    },
    licensesForState(stateCode) {
      return LICENSES.filter(l => l.stateCode === stateCode);
    },
    licenseById(id) {
      return LICENSES.find(l => l.id === id);
    },
    managerById(id) {
      return MANAGERS.find(m => m.id === id);
    },
    groundTruthManagers() {
      return MANAGERS.filter(m => m.isGroundTruth);
    },
    forkSourceManagers() {
      return MANAGERS;
    },
  };
})();
