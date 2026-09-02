"""
exceptions.py
=============
Exceptions métier personnalisées du microservice IA.

Centraliser les exceptions permet une gestion cohérente des erreurs
via les gestionnaires FastAPI (exception_handlers) et facilite le
débogage côté Spring Boot (codes d'erreurs stables).
"""


class AIServiceBaseException(Exception):
    """Exception de base pour toutes les erreurs métier du microservice."""

    def __init__(self, message: str, code: str = "AI_SERVICE_ERROR"):
        self.message = message
        self.code = code
        super().__init__(self.message)


class ModelNotLoadedException(AIServiceBaseException):
    """Levée lorsqu'un modèle ML requis n'a pas encore été entraîné/chargé."""

    def __init__(self, model_name: str):
        super().__init__(
            message=f"Le modèle '{model_name}' n'est pas chargé. Veuillez lancer l'entraînement.",
            code="MODEL_NOT_LOADED",
        )


class InvalidPatientDataException(AIServiceBaseException):
    """Levée lorsque les données patient reçues sont incohérentes ou invalides."""

    def __init__(self, message: str):
        super().__init__(message=message, code="INVALID_PATIENT_DATA")


class TrainingException(AIServiceBaseException):
    """Levée en cas d'échec durant l'entraînement d'un modèle."""

    def __init__(self, message: str):
        super().__init__(message=message, code="TRAINING_FAILED")


class DatasetNotFoundException(AIServiceBaseException):
    """Levée lorsque le dataset requis n'existe pas sur le disque."""

    def __init__(self, path: str):
        super().__init__(
            message=f"Dataset introuvable à l'emplacement : {path}",
            code="DATASET_NOT_FOUND",
        )


class PredictionException(AIServiceBaseException):
    """Levée en cas d'échec lors de la génération d'une prédiction."""

    def __init__(self, message: str):
        super().__init__(message=message, code="PREDICTION_FAILED")