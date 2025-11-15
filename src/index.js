/**
 * Base Markdown component
 * @author Mient-jan Stelling + contributors
 */

import React, {useMemo} from 'react';
import {Text} from 'react-native';
import {StyleSheet} from 'react-native-unistyles';
import parser from './lib/parser';
import getUniqueID from './lib/util/getUniqueID';
import hasParents from './lib/util/hasParents';
import openUrl from './lib/util/openUrl';
import tokensToAST from './lib/util/tokensToAST';
import renderRules from './lib/renderRules';
import AstRenderer from './lib/AstRenderer';
import MarkdownIt from '@rexovolt/markdown-it';
import removeTextStyleProps from './lib/util/removeTextStyleProps';
import {stringToTokens} from './lib/util/stringToTokens';
import textStyleProps from './lib/data/textStyleProps';

export {
  getUniqueID,
  openUrl,
  hasParents,
  renderRules,
  AstRenderer,
  parser,
  stringToTokens,
  tokensToAST,
  MarkdownIt,
  removeTextStyleProps,
  textStyleProps,
};

// we use StyleSheet.flatten here to make sure we have an object, in case someone
// passes in a StyleSheet.create result to the style prop
const getStyle = (style) => {
  let useStyles = {};

  if (style !== null) {
    Object.keys(style).forEach((value) => {
      useStyles[value] = {
        ...StyleSheet.flatten(style[value]),
      };
    });
  }

  Object.keys(useStyles).forEach((value) => {
    useStyles['_VIEW_SAFE_' + value] = removeTextStyleProps(useStyles[value]);
  });

  return StyleSheet.create(useStyles);
};

const getRenderer = (
  textcomponent,
  renderer,
  rules,
  style,
  onLinkPress,
  maxTopLevelChildren,
  topLevelMaxExceededItem,
  debugPrintTree,
) => {
  if (renderer && rules) {
    console.warn(
      'react-native-markdown-display you are using renderer and rules at the same time. This is not possible, props.rules is ignored',
    );
  }

  if (renderer && style) {
    console.warn(
      'react-native-markdown-display you are using renderer and style at the same time. This is not possible, props.style is ignored',
    );
  }

  // these checks are here to prevent extra overhead.
  if (renderer) {
    if (!(typeof renderer === 'function') || renderer instanceof AstRenderer) {
      return renderer;
    } else {
      throw new Error(
        'Provided renderer is not compatible with function or AstRenderer. please change',
      );
    }
  } else {
    const useStyles = getStyle(style);

    return new AstRenderer(
      {
        ...renderRules(textcomponent),
        ...(rules || {}),
      },
      useStyles,
      onLinkPress,
      maxTopLevelChildren,
      topLevelMaxExceededItem,
      debugPrintTree,
    );
  }
};

const Markdown = React.memo(
  ({
    children,
    textcomponent = Text,
    renderer = null,
    rules = null,
    style = null,
    markdownit = MarkdownIt({
      typographer: false,
    }),
    onLinkPress,
    maxTopLevelChildren = null,
    topLevelMaxExceededItem = <Text key="dotdotdot">...</Text>,
    debugPrintTree = false,
  }) => {
    const momoizedRenderer = useMemo(
      () =>
        getRenderer(
          textcomponent,
          renderer,
          rules,
          style,
          onLinkPress,
          maxTopLevelChildren,
          topLevelMaxExceededItem,
          debugPrintTree,
        ),
      [
        textcomponent,
        maxTopLevelChildren,
        onLinkPress,
        renderer,
        rules,
        style,
        topLevelMaxExceededItem,
        debugPrintTree,
      ],
    );

    const momoizedParser = useMemo(() => markdownit, [markdownit]);

    return parser(children, momoizedRenderer.render, momoizedParser);
  },
);

Markdown.displayName = 'Markdown';

export default Markdown;
