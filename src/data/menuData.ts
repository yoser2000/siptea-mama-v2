export interface MenuItem {
  id: string;
  name: string;
  price: number;
  image?: string;
}

export const MAMA_BASE_PRICE = 0;
export const ODEN_BASE_PRICE = 0;
export const EXTRA_NOODLE_PRICE = 10;

export const noodleFlavors: MenuItem[] = [
  // มาม่า
  { id: 'mama-tom-yum-goong', name: 'มาม่า ต้มยำกุ้ง', price: 15, image: '/images/mama/mama-tom-yum-goong.png' },
  { id: 'mama-tom-yum-goong-creamy', name: 'มาม่า ต้มยำกุ้งน้ำข้น', price: 15, image: '/images/mama/mama-tom-yum-goong-creamy.png' },
  { id: 'mama-green-curry-chicken', name: 'มาม่า แกงเขียวหวานไก่', price: 15, image: '/images/mama/mama-green-curry-chicken.png' },
  { id: 'mama-yentafo', name: 'มาม่า เย็นตาโฟ', price: 15, image: '/images/mama/mama-yentafo.png' },

  // ยำยำ จัมโบ้
  { id: 'yumyum-jumbo-tom-yum-seafood-hotpot', name: 'ยำยำ จัมโบ้ ต้มยำทะเลหม้อไฟ', price: 15, image: '/images/mama/yumyum-jumbo-tom-yum-seafood-hotpot.png' },
  { id: 'yumyum-jumbo-pad-ki-mao-dry', name: 'ยำยำ จัมโบ้ ผัดขี้เมา (แห้ง)', price: 15, image: '/images/mama/yumyum-jumbo-pad-ki-mao-dry.png' },
  { id: 'yumyum-jumbo-tom-yum-goong-creamy', name: 'ยำยำ จัมโบ้ ต้มยำกุ้งน้ำข้น', price: 15, image: '/images/mama/yumyum-jumbo-tom-yum-goong-creamy.png' },
  { id: 'yumyum-jumbo-tom-yum-goong', name: 'ยำยำ จัมโบ้ ต้มยำกุ้ง', price: 15, image: '/images/mama/yumyum-jumbo-tom-yum-goong.png' },

  // ไวไว
  { id: 'waiwai-minced-pork', name: 'ไวไว หมูสับ', price: 15, image: '/images/mama/waiwai-minced-pork.png' },
  { id: 'waiwai-minced-pork-tom-yum', name: 'ไวไว หมูสับต้มยำ', price: 15, image: '/images/mama/waiwai-minced-pork-tom-yum.png' },
  { id: 'waiwai-clam-pad-cha', name: 'ไวไว หอยลายผัดฉ่า', price: 15, image: '/images/mama/waiwai-clam-pad-cha.png' },

  // นิสชิน
  { id: 'nissin-tom-yum-goong-spicy', name: 'นิสชิน ต้มยำกุ้งแซ่บ', price: 15, image: '/images/mama/nissin-tom-yum-goong-spicy.png' },
  { id: 'nissin-minced-pork', name: 'นิสชิน หมูสับ', price: 15, image: '/images/mama/nissin-minced-pork.png' },
  { id: 'nissin-pork-lime', name: 'นิสชิน หมูมะนาว', price: 15, image: '/images/mama/nissin-pork-lime.png' },
  { id: 'nissin-leng-saab', name: 'นิสชิน เล้งแซ่บ', price: 15, image: '/images/mama/nissin-leng-saab.png' },
  { id: 'nissin-korean-spicy-chicken', name: 'นิสชิน ไก่เผ็ดเกาหลี', price: 25, image: '/images/mama/nissin-korean-spicy-chicken.png' },
  { id: 'nissin-korean-spicy-chicken-cheese', name: 'นิสชิน ไก่เผ็ดเกาหลีชีส', price: 25, image: '/images/mama/nissin-korean-spicy-chicken-cheese.png' },
  { id: 'nissin-korean-spicy-chicken-salted-egg', name: 'นิสชิน ไก่เผ็ดเกาหลีไข่เค็ม', price: 25, image: '/images/mama/nissin-korean-spicy-chicken-salted-egg.png' },
  { id: 'nissin-tom-yum-shrimp-cream-sauce', name: 'นิสชิน ซอสครีมต้มยำมันกุ้ง', price: 25, image: '/images/mama/nissin-tom-yum-shrimp-cream-sauce.png' },
  { id: 'nissin-tom-yum-shrimp-creamy', name: 'นิสชิน ต้มยำมันกุ้งน้ำข้น', price: 25, image: '/images/mama/nissin-tom-yum-shrimp-creamy.png' },

  // ยำยำ พรีเมียม
  { id: 'yumyum-pad-cha-seafood', name: 'ยำยำ ผัดฉ่าทะเล', price: 25, image: '/images/mama/yumyum-pad-cha-seafood.png' },
  { id: 'yumyum-spicy-raptor', name: 'ยำยำ สไปร์ซี่รอปเตอร์', price: 25, image: '/images/mama/yumyum-spicy-raptor.png' },
  { id: 'yumyum-tom-yum-goong-creamy', name: 'ยำยำ ต้มยำกุ้งน้ำข้น', price: 25, image: '/images/mama/yumyum-tom-yum-goong-creamy.png' },
  { id: 'yumyum-tom-yum-goong', name: 'ยำยำ ต้มยำกุ้ง', price: 25, image: '/images/mama/yumyum-tom-yum-goong.png' },
  { id: 'yumyum-truffle-crab-cream', name: 'ยำยำ ทัฟเฟิลครีมปู', price: 25, image: '/images/mama/yumyum-truffle-crab-cream.png' },
  { id: 'yumyum-spicy-triple-cheese', name: 'ยำยำ สไปร์ซี่ทริปเปิ้ลชีส', price: 25, image: '/images/mama/yumyum-spicy-triple-cheese.png' },
  { id: 'yumyum-scallop-xo', name: 'ยำยำ หอยเซล XO', price: 25, image: '/images/mama/yumyum-scallop-xo.png' },

  // มาม่า OK
  { id: 'mama-ok-oriental-hot-korean', name: 'มาม่าOK ออเรียลทัลฮอตโคเรียน', price: 35, image: '/images/mama/mama-ok-oriental-hot-korean.png' },
  { id: 'mama-ok-shrimp-tom-yum-sauce', name: 'มาม่าOK กุ้งซอสต้มยำ', price: 35, image: '/images/mama/mama-ok-shrimp-tom-yum-sauce.png' },
  { id: 'mama-ok-salted-egg-stir-fry', name: 'มาม่าOK ผัดไข่เค็ม', price: 35, image: '/images/mama/mama-ok-salted-egg-stir-fry.png' },
  { id: 'mama-ok-paneng-beef', name: 'มาม่าOK แพนงเนื้อ', price: 35, image: '/images/mama/mama-ok-paneng-beef.png' },
  { id: 'mama-ok-takoyaki', name: 'มาม่าOK ทาโกะยากิ', price: 35, image: '/images/mama/mama-ok-takoyaki.png' },
  { id: 'mama-ok-carbonara', name: 'มาม่าOK คาโบนาร่า', price: 35, image: '/images/mama/mama-ok-carbonara.png' },
  { id: 'mama-ok-mala-beef', name: 'มาม่าOK หมาล่าเนื้อ', price: 35, image: '/images/mama/mama-ok-mala-beef.png' },
  { id: 'mama-ok-hot-spicy', name: 'มาม่าOK ฮอตสไปร์ซี่', price: 35, image: '/images/mama/mama-ok-hot-spicy.png' },

  // ซัมยัง
  { id: 'samyang-hot-chicken-dry', name: 'ซัมยังแห้งรสไก่สูตรเผ็ด', price: 65, image: '/images/mama/samyang-hot-chicken-dry.png' },
  { id: 'samyang-hot-chicken-dry-x2', name: 'ซัมยังแห้งรสไก่สูตรเผ็ดX2', price: 65, image: '/images/mama/samyang-hot-chicken-dry-x2.png' },
  { id: 'samyang-hot-chicken-dry-x3', name: 'ซัมยังแห้งรสไก่สูตรเผ็ดX3', price: 65, image: '/images/mama/samyang-hot-chicken-dry-x3.png' },
  { id: 'samyang-carbonara-cheese', name: 'ซัมยังสูตรคาโบนาร่าชีส', price: 65, image: '/images/mama/samyang-carbonara-cheese.png' },
  { id: 'samyang-dry-cheese', name: 'ซัมยังแห้งสูตรชีส', price: 65, image: '/images/mama/samyang-dry-cheese.png' },
  { id: 'samyang-hot-chicken-soup', name: 'ซัมยังรสไก่เผ็ดสูตรน้ำ', price: 65, image: '/images/mama/samyang-hot-chicken-soup.png' },
  { id: 'samyang-jjajang', name: 'ซัมยังสูตรจาจังเมียน', price: 65, image: '/images/mama/samyang-jjajang.png' },
  { id: 'samyang-mala-hot-chicken', name: 'ซัมยังพริกหม่าล่าไก่สูตรเผ็ด', price: 65, image: '/images/mama/samyang-mala-hot-chicken.png' },
];




export const sharedToppings: MenuItem[] = [
  // เบสิค
  { id: 'egg', name: 'ไข่', price: 10, image: '/images/topping/egg.png' },
  { id: 'soft-boiled-egg', name: 'ไข่ต้มยางมะตูม', price: 10, image: '/images/topping/soft-boiled-egg.png' },
  { id: 'minced-pork', name: 'หมูสับ', price: 20, image: '/images/topping/minced-pork.png' },
  { id: 'ground-pork', name: 'หมูบด', price: 20, image: '/images/topping/ground-pork.png' },
  { id: 'pork-slice', name: 'หมูสไลด์', price: 20, image: '/images/topping/pork-slice.png' },
  { id: 'pork-belly-slice', name: 'หมูสามชั้นสไลด์', price: 20, image: '/images/topping/pork-belly-slice.png' },

  // ไส้กรอก / แฟรงค์
  { id: 'red-sausage', name: 'ไส้กรอกแดง', price: 10, image: '/images/topping/red-sausage.png' },
  { id: 'cheese-sausage', name: 'ไส้กรอกชีส', price: 10, image: '/images/topping/cheese-sausage.png' },
  { id: 'pink-milk-frank', name: 'แฟรงค์นมชมพู', price: 10, image: '/images/topping/pink-milk-frank.png' },
  { id: 'bacon-wrapped-sausage', name: 'เบคอนพันไส้กรอก', price: 15, image: '/images/topping/bacon-wrapped-sausage.png' },
  { id: 'crispy-chicken-frank', name: 'ชิกเก้นแฟรงค์ หนังกรอบ', price: 15, image: '/images/topping/crispy-chicken-frank.png' },

  // ลูกชิ้น / ของแปรรูป
  { id: 'smoked-cocktail', name: 'คอกเทลรมควัน', price: 10, image: '/images/topping/smoked-cocktail.png' },
  { id: 'pork-meatball', name: 'ลูกชิ้นหมู', price: 10, image: '/images/topping/pork-meatball.png' },
  { id: 'beef-meatball', name: 'ลูกชิ้นเนื้อ', price: 10, image: '/images/topping/beef-meatball.png' },
  { id: 'fish-meatball', name: 'ลูกชิ้นปลา', price: 10, image: '/images/topping/fish-meatball.png' },
  { id: 'fish-tofu-slab', name: 'เต้าหู้ปลาแผ่น', price: 10, image: '/images/topping/fish-tofu-slab.png' },
  { id: 'fish-tofu-cube', name: 'เต้าหู้ปลา (เหลี่ยม)', price: 15, image: '/images/topping/fish-tofu-cube.png' },
  { id: 'cheese-tofu', name: 'เต้าหู้ชีส', price: 15, image: '/images/topping/cheese-tofu.png' },
  { id: 'bologna-spicy', name: 'โบโลน่า พริก', price: 15, image: '/images/topping/bologna-spicy.png' },
  // ซีฟู้ด
  { id: 'squid-tube', name: 'ปลาหมึกหลอด', price: 10, image: '/images/topping/squid-tube.png' },
  { id: 'cheese-crabstick', name: 'ปูอัดทูโทนชีส', price: 15, image: '/images/topping/cheese-crabstick.png' },
  { id: 'crab-roe-ball', name: 'ปูจ๋าไข่แดง', price: 15, image: '/images/topping/crab-roe-ball.png' },
  { id: 'shrimp-egg-bun', name: 'เปาทูโทนไส้ไข่กุ้ง', price: 15, image: '/images/topping/shrimp-egg-bun.png' },
  { id: 'shishamo-bun', name: 'เปาทูโทนชิชาโมะ', price: 15, image: '/images/topping/shishamo-bun.png' },

  // ของทอด / พัน
  { id: 'shrimp-seaweed-roll', name: 'กุ้งพันสาหร่าย', price: 10, image: '/images/topping/shrimp-seaweed-roll.png' },
  { id: 'fish-roll-seaweed', name: 'ปลาม้วนสาหร่าย', price: 15, image: '/images/topping/fish-roll-seaweed.png' },

  // ผัก / เห็ด / สาหร่าย
  { id: 'mixed-veggies', name: 'ชุดผักรวม', price: 10, image: '/images/topping/mixed-veggies.png' },
  { id: 'wakame-seaweed', name: 'สาหร่ายวากาเมะ', price: 10, image: '/images/topping/wakame-seaweed.png' },
  { id: 'seafood-tofu-skin', name: 'ฟองเต้าหู้ซีฟู้ด', price: 10, image: '/images/topping/seafood-tofu-skin.png' },
  { id: 'tofu-skin-roll', name: 'ฟองเต้าหู้ม้วน', price: 10, image: '/images/topping/tofu-skin-roll.png' },
];


export const spicyLevels = [
  { id: 'none', name: 'ไม่เผ็ด', emoji: '😊' },
  { id: 'mild', name: 'เผ็ดน้อย', emoji: '🌶️' },
  { id: 'medium', name: 'เผ็ดปกติ', emoji: '🌶️🌶️' },
  { id: 'hot', name: 'เผ็ดมาก', emoji: '🌶️🌶️🌶️' },
];

export const soupTypes: MenuItem[] = [
  { id: 'black-soup', name: 'ซุปน้ำดำ', price: 0 , image: '/images/topping/black-soup.png' },
  { id: 'tonkotsu', name: 'ซุปทงคตสึ', price: 0 , image: '/images/topping/tonkotsu.png' },
  { id: 'mala', name: 'หมาล่า', price: 10 , image: '/images/topping/mala.png' },
];

export const dippingSauces: MenuItem[] = [
  { id: 'suki-sauce', name: 'น้ำจิ้มสุกี้', price: 0 },
  { id: 'house-sesame-sauce', name: 'น้ำจิ้มงาสูตรทางร้าน', price: 0 },
];

export const odenAddOns: MenuItem[] = [
  { id: 'extra-soup', name: 'น้ำซุปเพิ่ม', price: 5 },
  { id: 'rice', name: 'ข้าวสวย', price: 10 },
  { id: 'udon', name: 'เส้นอูด้ง', price: 15 },
];