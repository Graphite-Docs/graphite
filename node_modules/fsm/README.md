# fsm

check properties of finite state machines.

There is a lot of academic research in this area, yet this module is very simple.
There are a lot of fancy tools available, but they are not easy to use.
If idea is really useful, then I think a very simple tool should be viable.

## License

MIT

# Example

Define FSM as json, here is a stream with 4 states.
This FSM expresses the constraint that the stream *must not*
emit 'data' when paused, and also that it *must not* emit
data after 'end'.

``` js
{
  START: {
    data   : 'START',
    pause  : 'PAUSED',
    end    : 'END',
    error  : 'ERROR'
  },
  PAUSED: {
    pause  : 'PAUSED',
    resume : 'START',
    error  : 'ERROR'
  },
  ERROR: {},
  END: {}
}
```

we can check a number of properties of this machine.
does this machine halt? (and in the right place?)
can you reach every state from every other?

## API

### validate (fsm)

check that all transitions are to defined states.

### reachable (fsm)

calculate all states can reach each other states.
the result is in the form of

``` js
{STATE1: {STATE2: [event path from S1 to S2]}}
```

### terminal (fsm)

return the list of states that cannot reach another state.

alias: `deadlock'

### livelock (fsm, [terminal])

get list of states that cannot reach a terminal state.

### combine(fsm1, fsm2, start1, start2)

combine two fsm into one, obeying all the transitions in each.
TODO: throw an error if there are transitions that are impossible in the combined machine.


