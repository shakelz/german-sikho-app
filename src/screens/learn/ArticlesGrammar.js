import React from 'react';
import GrammarLesson from './GrammarLesson';

const ArticlesGrammar = ({ navigation, route }) => {
    // JungleThemeScreen passes { lessonData: node }
    // GrammarLesson expects { lessonId: string }
    // We map it here.

    const params = {
        lessonId: 'articles'
    };

    return <GrammarLesson navigation={navigation} route={{ params }} />;
};

export default ArticlesGrammar;
