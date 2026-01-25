const POST_MAPPING = {
    '258': 'tique-herisson',
    '263': 'bebe-herisson-presentation-et-comment-sen-occuper',
    '239': 'soccuper-dun-herisson-sauvage',
    '162': 'hibernation-herisson',
    '222': 'signification-herisson-jardin',
    '232': 'predateurs-herisson',
    '323': 'sauver-les-herissons',
    '404': 'crottes-herissons',
    '413': 'que-mange-un-herisson'
};

const sample = '258';
console.log(`Key ${sample} maps to: ${POST_MAPPING[sample]}`);
const sample2 = '413';
console.log(`Key ${sample2} maps to: ${POST_MAPPING[sample2]}`);

// Check if string vs number matters
const keyNum = 258;
console.log(`Key number ${keyNum} maps to: ${POST_MAPPING[keyNum]}`);
