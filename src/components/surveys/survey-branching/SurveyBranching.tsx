import ConfirmationDialog from '@components/widgets/ConfirmationDialog'
import {Box, styled} from '@mui/material'
import {useSurveyConfig, useUpdateSurveyConfig} from '@services/assessmentHooks'
import {latoFont} from '@style/theme'
import {SmartStepEdge} from '@tisoap/react-flow-smart-edge'
import {ChoiceQuestion, Survey} from '@typedefs/surveys'
import React, {FunctionComponent} from 'react'

import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Connection,
  Edge,
  EdgeChange,
  FitViewOptions,
  Node,
  NodeChange,
} from 'react-flow-renderer'

import {RouteComponentProps, useParams} from 'react-router-dom'
import NavigationPrompt from 'react-router-navigation-prompt'
import BranchingConfig from './BranchingConfig'
import getNodes, {detectCycle, getEdgesFromSteps} from './GetNodesToPlot'
import {useGetPlotWidth} from './UseGetPlotWidth'

const edgeTypes = {
  smart: SmartStepEdge,
}

const SurveyBranchingContainerBox = styled(Box)(({theme}) => ({
  position: 'relative',
  backgroundColor: '#fcfcfc',
  padding: theme.spacing(3),
  width: '100%',
  height: 'calc(100vh - 75px)',
  overflow: 'scroll',
  '& .react-flow': {
    backgroundColor: '#fcfcfc',
  },
  '& .react-flow__node-default': {
    borderRadius: 0,
    background: '#F2F2F2',
    border: 'none',
    padding: 0,
    textAlign: 'center',

    boxShadow: '1px 2px 3px rgba(42, 42, 42, 0.1)',
    width: '85px',
    height: '48px',
    fontFamily: latoFont,
    fontWeight: 700,
    fontSize: '14px',
    color: ' #4d4d4d',
    '& .react-flow__handle': {
      backgroundColor: 'transparent',
      borderRadius: '0',
      border: 'none',
    },
    '&.selected': {
      border: '1px solid black',
    },
  },
}))

type SurveyBranchingOwnProps = {}

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
}

type SurveyBranchingProps = SurveyBranchingOwnProps & RouteComponentProps

const SurveyBranching: FunctionComponent<SurveyBranchingProps> = () => {
  let {id: surveyGuid} = useParams<{
    id: string
  }>()

  const ref = React.useRef<HTMLDivElement>(null)
  const {width} = useGetPlotWidth(ref)
  const [survey, setSurvey] = React.useState<Survey | undefined>()
  const [error, setError] = React.useState('')
  const [hasObjectChanged, setHasObjectChanged] = React.useState(false)
  const [currentStepIndex, setCurrentStepIndex] = React.useState<
    number | undefined
  >(-1)
  const [isHideInput, setIsHideInput] = React.useState(true)

  const [nodes, setNodes] = React.useState<Node[]>([])
  const [edges, setEdges] = React.useState<Edge[]>([])

  const onNodesChange = React.useCallback(
    (changes: NodeChange[]) => setNodes(nds => applyNodeChanges(changes, nds)),
    [setNodes]
  )
  const onEdgesChange = React.useCallback(
    (changes: EdgeChange[]) => setEdges(eds => applyEdgeChanges(changes, eds)),
    [setEdges]
  )
  const onConnect = React.useCallback(
    (connection: Connection) => setEdges(eds => addEdge(connection, eds)),
    [setEdges]
  )

  const {data: _survey} = useSurveyConfig(surveyGuid)

  const {mutateAsync: mutateSurvey} = useUpdateSurveyConfig()

  React.useEffect(() => {
    if (_survey) {
      setSurvey(_survey)
    }
  }, [_survey])

  React.useEffect(() => {
    if (survey) {
      const plotWidth = width || 0
      const result = getNodes(
        survey?.config.steps as ChoiceQuestion[],
        plotWidth
      )
      if (result.error) {
        setError(result.error)
      } else {
        setNodes(result.nodes)
        setEdges(result.edges)
      }
    }
  }, [survey, survey?.config.steps, width])

  const saveSurvey = async () => {
    setError('')
    try {
      await mutateSurvey({guid: surveyGuid, survey: survey!})
      setHasObjectChanged(false)
      setIsHideInput(true)
    } catch (error) {
      setError((error as any).toString())
    }
  }

  const changeBranching = (steps: ChoiceQuestion[]) => {
    const edges = getEdgesFromSteps(steps)
    setError('')
    const cycles = detectCycle(edges.edges)
    if (cycles) {
      setError('Cycles detected')
      return
    } else {
      setHasObjectChanged(true)
      setSurvey({
        ...survey,
        config: {...survey!.config, steps: steps},
      })
    }
  }

  const onNodeClick = (x: any, node: Node) => {
    const qIndex = survey!.config.steps!.findIndex(
      q => q.identifier === node.id
    )
    if (qIndex < survey!.config.steps.length - 1) {
      setCurrentStepIndex(qIndex)
      setIsHideInput(false)
    }
  }

  const getCurrentStep = (): ChoiceQuestion | undefined =>
    survey && currentStepIndex !== undefined
      ? (survey.config.steps[currentStepIndex] as ChoiceQuestion)
      : undefined

  const getInvalidTargetStepIds = (): string[] => {
    const currentStep = getCurrentStep()
    if (!currentStep) {
      return []
    }
    const sourceNodesIds = edges
      .filter(e => e.target === currentStep.identifier)
      .map(n => n.source)
      .concat([currentStep.identifier])
    return sourceNodesIds
  }

  const findHeightOfNodes = () => {
    const yPos = nodes.map(n => n.position.y)
    const max = Math.max(...yPos)
    return max + 150
  }

  return (
    <>
      <NavigationPrompt when={hasObjectChanged} key="nav_prompt">
        {({onConfirm, onCancel}) => (
          <ConfirmationDialog
            isOpen={hasObjectChanged}
            type={'NAVIGATE'}
            onCancel={onCancel}
            onConfirm={onConfirm}
          />
        )}
      </NavigationPrompt>

      <SurveyBranchingContainerBox>
        {error && <span>{error.toString()}</span>}
        <Box ref={ref}>
          <div
            style={{
              width: (width || 0) + 'px',
              height: `${findHeightOfNodes()}px`,
            }}>
            <ReactFlow
              style={{}}
              zoomOnScroll={false}
              nodes={nodes}
              edges={edges}
              onNodeClick={onNodeClick}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              preventScrolling={false}
              onConnect={onConnect}
              edgeTypes={edgeTypes}
              fitView={false}
              fitViewOptions={fitViewOptions}
            />
          </div>
        </Box>

        {edges && getCurrentStep() && (
          <BranchingConfig
            onCancel={() => {
              setSurvey(_survey)
              setIsHideInput(true)
            }}
            error={error}
            onSave={() => saveSurvey()}
            isOpen={!isHideInput}
            invalidTargetStepIds={getInvalidTargetStepIds()}
            onChange={steps => changeBranching(steps)}
            questions={survey!.config.steps as ChoiceQuestion[]}
            step={getCurrentStep()}
          />
        )}
      </SurveyBranchingContainerBox>
    </>
  )
}
export default SurveyBranching
