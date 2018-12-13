MYPY = False
if MYPY:
    import typing  # noqa: F401 # pylint: disable=import-error,unused-import,useless-suppression

try:
    # Works for Py 3.3+
    from unittest.mock import Mock
except ImportError:
    # See https://github.com/python/mypy/issues/1153#issuecomment-253842414
    from mock import Mock  # type: ignore

from stone.backend import Backend  # noqa: F401 # pylint: disable=unused-import

def _mock_emit(backend):
    # type: (Backend) -> typing.List[str]
    """
    Mock out Backend's .emit function, and return a list containing all params
    emit was called with.
    """
    recorded_emits = []  # type: typing.List[str]

    def record_emit(s):
        recorded_emits.append(s)

    orig_append = backend._append_output
    backend._append_output = Mock(wraps=orig_append, side_effect=record_emit)  # type: ignore

    return recorded_emits
