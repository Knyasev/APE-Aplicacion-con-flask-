from abc import ABC, abstractmethod

class Observer(ABC):
    """
    La interfaz del Observador declara el método de actualización, utilizado por los sujetos.
    """
    @abstractmethod
    def update(self, subject, data=None):
        pass

class Subject(ABC):
    """
    La interfaz del Sujeto declara un conjunto de métodos para gestionar suscriptores.
    """
    @abstractmethod
    def subscribe(self, observer: Observer):
        pass

    @abstractmethod
    def unsubscribe(self, observer: Observer):
        pass

    @abstractmethod
    def notify(self, data=None):
        pass