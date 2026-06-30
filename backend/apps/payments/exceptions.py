class PaymentAlreadyExistsError(Exception):
    """Raised when trying to create a payment for an inscription that already has one."""
    pass


class PaymentNotFoundError(Exception):
    """Raised when a payment is not found."""
    pass


class InvalidPaymentStatusError(Exception):
    """Raised when an action is not valid for the current payment status."""
    pass


class InscriptionNotFoundError(Exception):
    """Raised when an inscription is not found."""
    pass