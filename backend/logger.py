"""
Pixova AI - Structured Logging
Production-grade logging with request tracing and context
"""
import logging
import sys
import json
from datetime import datetime, timezone
from typing import Any, Optional
from contextvars import ContextVar
import uuid

# Context variable for request tracing
request_id_ctx: ContextVar[str] = ContextVar("request_id", default="no-request")
user_id_ctx: ContextVar[str] = ContextVar("user_id", default="anonymous")


class JsonFormatter(logging.Formatter):
    """JSON log formatter for structured logging in production"""
    
    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "request_id": request_id_ctx.get(),
            "user_id": user_id_ctx.get(),
        }
        
        # Add extra fields
        if hasattr(record, "extra_data"):
            log_data["data"] = record.extra_data
        
        # Add exception info
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        
        # Add source location in debug
        if record.levelno == logging.DEBUG:
            log_data["source"] = {
                "file": record.filename,
                "line": record.lineno,
                "function": record.funcName
            }
        
        return json.dumps(log_data)


class TextFormatter(logging.Formatter):
    """Human-readable formatter for development"""
    
    COLORS = {
        "DEBUG": "\033[90m",     # Dark Gray
        "INFO": "\033[36m",      # Cyan
        "WARNING": "\033[33m",   # Yellow
        "ERROR": "\033[31m",     # Red
        "CRITICAL": "\033[35m",  # Magenta
    }
    RESET = "\033[0m"
    BOLD = "\033[1m"
    DIM = "\033[2m"
    
    def format(self, record: logging.LogRecord) -> str:
        color = self.COLORS.get(record.levelname, "")
        req_id = request_id_ctx.get()[:8] if request_id_ctx.get() != "no-request" else "--------"
        
        # Create cleaner message
        msg = record.getMessage()
        
        # Format based on log level
        if record.levelno == logging.DEBUG:
            # Debug: Dim and minimal
            base = f"{self.DIM}  → {msg}{self.RESET}"
        elif record.levelno == logging.INFO:
            # Info: Clean and prominent
            base = f"{color}{self.BOLD}▶{self.RESET} {msg}"
        elif record.levelno == logging.WARNING:
            base = f"{color}{self.BOLD}⚠ {msg}{self.RESET}"
        elif record.levelno >= logging.ERROR:
            base = f"{color}{self.BOLD}✖ {msg}{self.RESET}"
        else:
            base = f"{color}  {msg}{self.RESET}"
        
        # Add extra data in a cleaner format
        if hasattr(record, "extra_data") and record.extra_data:
            extras = []
            for k, v in record.extra_data.items():
                # Format values nicely
                if isinstance(v, int) and 'ms' in k:
                    extras.append(f"{k}={v}ms")
                elif isinstance(v, str) and len(v) > 50:
                    extras.append(f"{k}={v[:47]}...")
                else:
                    extras.append(f"{k}={v}")
            if extras:
                base += f" {self.DIM}({', '.join(extras)}){self.RESET}"
        
        if record.exc_info:
            base += f"\n{self.formatException(record.exc_info)}"
        
        return base


class ContextLogger:
    """
    Logger wrapper with context awareness and structured data support.
    Usage:
        logger = get_logger(__name__)
        logger.info("User created", user_id="123", plan="pro")
    """
    
    def __init__(self, logger: logging.Logger):
        self._logger = logger
    
    def _log(self, level: int, msg: str, exc_info: bool = False, **kwargs):
        record = self._logger.makeRecord(
            self._logger.name, level, "", 0, msg, (), None
        )
        if kwargs:
            record.extra_data = kwargs
        if exc_info:
            record.exc_info = sys.exc_info()
        self._logger.handle(record)
    
    def debug(self, msg: str, **kwargs):
        self._log(logging.DEBUG, msg, **kwargs)
    
    def info(self, msg: str, **kwargs):
        self._log(logging.INFO, msg, **kwargs)
    
    def warning(self, msg: str, **kwargs):
        self._log(logging.WARNING, msg, **kwargs)
    
    def error(self, msg: str, exc_info: bool = True, **kwargs):
        self._log(logging.ERROR, msg, exc_info=exc_info, **kwargs)
    
    def critical(self, msg: str, exc_info: bool = True, **kwargs):
        self._log(logging.CRITICAL, msg, exc_info=exc_info, **kwargs)


def setup_logging(level: str = "INFO", format_type: str = "json"):
    """
    Initialize application logging.
    Call once at startup.
    """
    root = logging.getLogger()
    root.setLevel(getattr(logging, level.upper()))
    
    # Remove existing handlers
    root.handlers.clear()
    
    # Create handler
    handler = logging.StreamHandler(sys.stdout)
    
    # Set formatter based on type
    if format_type == "json":
        handler.setFormatter(JsonFormatter())
    else:
        handler.setFormatter(TextFormatter())
    
    root.addHandler(handler)
    
    # Suppress noisy loggers
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)


def get_logger(name: str) -> ContextLogger:
    """Get a context-aware logger instance"""
    return ContextLogger(logging.getLogger(name))


def generate_request_id() -> str:
    """Generate a unique request ID"""
    return str(uuid.uuid4())


def set_request_context(request_id: str, user_id: str = "anonymous"):
    """Set request context for logging"""
    request_id_ctx.set(request_id)
    user_id_ctx.set(user_id)


def clear_request_context():
    """Clear request context"""
    request_id_ctx.set("no-request")
    user_id_ctx.set("anonymous")