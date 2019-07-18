//@flow

import React from 'react'
import {combine} from 'effector'
import {createComponent} from 'effector-react'
import debounce from 'lodash.debounce'

import 'codemirror/lib/codemirror.css'
import './styles.css'
import {VersionLink} from './components/VersionLink'
import {VersionSelector} from './components/VersionSelector'
import {SidebarHeader} from './components/SidebarHeader'
import Panel from './components/CodeMirrorPanel'
import Errors from './components/Errors'
import SecondanaryTabs from './components/SecondanaryTabs'
import Outline from './components/Outline'
import {TypeHintView} from './flow/view'
import {isDesktopChanges, tab} from './tabs/domain'
import {TabsView} from './tabs/view'
import {mode} from './mode/domain'
import {
  selectVersion,
  sourceCode,
  changeSources,
  performLint,
  codeError,
  stats,
  version,
  codeMarkLine,
  codeCursorActivity,
  codeSetCursor,
  packageVersions,
} from './domain'
import {typechecker} from './settings/domain'

const OutlineView = createComponent(
  {
    displayOutline: combine(tab, isDesktopChanges, (tab, isDesktop) =>
      isDesktop ? true : tab === 'outline',
    ),
    stats,
  },
  ({}, {displayOutline, stats}) => (
    <Outline
      style={{visibility: displayOutline ? 'visible' : 'hidden'}}
      {...stats}
    />
  ),
)

const ErrorsView = createComponent(
  codeError,
  ({}, {isError, error, stackFrames}) => (
    <Errors isError={isError} error={error} stackFrames={stackFrames} />
  ),
)

const changeSourcesDebounced = debounce(changeSources, 500)
const CodeView = createComponent(
  {
    displayEditor: combine(tab, isDesktopChanges, (tab, isDesktop) =>
      isDesktop ? true : tab === 'editor',
    ),
    sourceCode,
    mode,
  },
  ({}, {displayEditor, mode, sourceCode}) => (
    <div
      className="sources"
      style={{visibility: displayEditor ? 'visible' : 'hidden'}}>
      <Panel
        markLine={codeMarkLine}
        setCursor={codeSetCursor}
        performLint={performLint}
        onCursorActivity={codeCursorActivity}
        value={sourceCode}
        mode={mode}
        onChange={changeSourcesDebounced}
        lineWrapping
        passive
      />
      <TypeHintView />
    </div>
  ),
)

const VersionLinkView = createComponent(version, ({}, version) => (
  <VersionLink version={version} />
))

//const versions = useStore(packageVersions)
//const selected = useStore(version)
//TODO: bug in createComponent, probably actually in watchers
//,
const VersionSelectorView = createComponent(
  {versions: packageVersions, selected: version},
  (_, {versions, selected}) => (
    <VersionSelector
      versions={versions}
      selected={selected}
      onChange={selectVersion}
    />
  ),
)

export default (
  <>
    <VersionLinkView />
    <OutlineView />
    <CodeView />
    <SidebarHeader>
      <VersionSelectorView />
    </SidebarHeader>
    <TabsView />
    <SecondanaryTabs />
    <ErrorsView />
  </>
)
